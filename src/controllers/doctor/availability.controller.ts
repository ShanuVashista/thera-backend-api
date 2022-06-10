import { StatusCodes } from "http-status-codes";
import Availability from "../../db/models/availability.model";
import { filterPaginate } from "../../lib/filterPaginate";

export const updateAvailability = async (req, res) => {
  console.log("req", req.body);

  const newArr = req.body.data;
  console.log("newArr", newArr);
  try {
    await checkForConflict(newArr, req.user._id);
    const availabilities = await Availability.bulkWrite(
      newArr.map((availability) =>
        availability._id
          ? {
              updateOne: {
                filter: {
                  _id: availability._id,
                  doctorId: req.user._id,
                },
                update: {
                  ...availability,
                  doctorId: req.user._id,
                },
              },
            }
          : {
              insertOne: {
                document: {
                  ...availability,
                  doctorId: req.user._id,
                },
              },
            }
      )
    );

    if (!req.user.isAvailability) {
      req.user.isAvailability = true;
      await req.user.save({ validateBeforeSave: false });
    }

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Availability added",
      data: { availabilities },
    });
  } catch (error) {
    console.log("Error in adding availability", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const listAvailability = async (req, res) => {
  try {
    const { f = {}, upcoming = 1 } = req.query;

    const filter = {
      doctorId: req.user._id,
      ...f,
    };

    if (upcoming > 0) {
      filter.end = {
        $gte: new Date(),
      };
    }

    const data = await filterPaginate(Availability, filter, req.query);

    if (data.total === 0) {
      return res.status(StatusCodes.OK).json({
        type: "success",
        status: true,
        message: "No availability found",
        data: { availabilities: data },
      });
    }

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Availability found",
      data,
    });
  } catch (error) {
    console.log("Error in listing availability", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findOne({
      _id: id,
      doctorId: req.user._id,
    });

    if (!availability) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Availability not found",
      });
    }

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Availability found",
      data: { availability },
    });
  } catch (error) {
    console.log("Error in listing availability", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findOne({
      _id: id,
      doctorId: req.user._id,
    });

    if (!availability) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Availability not found",
      });
    }

    await Availability.deleteOne({
      _id: id,
      doctorId: req.user._id,
    });

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Availability deleted",
    });
  } catch (error) {
    console.log("Error in deleting availability", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export async function checkForConflict(availabilities, doctorId) {
  const sortedAvailabilities = availabilities
    .map((availability) => ({
      ...availability,
      start: new Date(availability.start),
      end: new Date(availability.end),
    }))
    .sort((a, b) => {
      if (a.start < b.start) {
        return -1;
      }
      if (a.start > b.start) {
        return 1;
      }
      return 0;
    });

  checkConflictInSortedData(sortedAvailabilities);
  await checkConflictWithDatabase(doctorId, sortedAvailabilities);
}

function checkConflictInSortedData(
  sortedAvailabilities: {
    start: Date;
    end: Date;
  }[]
): void {
  for (let i = 0; i < sortedAvailabilities.length - 1; i++) {
    const current = sortedAvailabilities[i];
    const next = sortedAvailabilities[i + 1];
    if (current.end >= next.start) {
      throw new Error("Conflict in provided availability data");
    }
  }
}

async function checkConflictWithDatabase(
  doctorId: string,
  sortedAvailabilities: {
    _id: string;
    start: Date;
    end: Date;
  }[]
) {
  const dbAvailabilities = await Availability.find({
    doctorId: doctorId,
    $or: [
      ...sortedAvailabilities.map((availability) => ({
        _id: {
          $ne: availability._id,
        },
        $or: [
          {
            start: { $lte: availability.start },
            end: { $gte: availability.start },
          },
          {
            start: { $lte: availability.end },
            end: { $gte: availability.end },
          },
          {
            start: { $gte: availability.start },
            end: { $lte: availability.end },
          },
        ],
      })),
    ],
  });

  if (dbAvailabilities.length) {
    throw new Error("Conflict with existing availability");
  }
}
