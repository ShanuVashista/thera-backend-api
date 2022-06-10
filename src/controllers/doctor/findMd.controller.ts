import { StatusCodes } from "http-status-codes";
import User from "../../db/models/user";
import { filterPaginate } from "../../lib/filterPaginate";
import { Roles } from "../../lib/roles";
import {
  checkAppointmentTimeConflict,
  ListAvailability,
} from "../appointment/availabilityUtil";
import { IUser } from "../../db/models/user";

export const findMd = async (req, res) => {
  try {
    const { f = {}, appointmentTime = "" } = req.query;

    if (appointmentTime) {
      const appointmentConflict = await checkAppointmentTimeConflict(
        new Date(appointmentTime),
        { patientId: req.user._id }
      );
      console.log({ appointmentConflict });
      if (appointmentConflict) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          type: "error",
          status: false,
          message: "Appointment time conflict",
        });
      }
    }

    // const filterLocation = f.location ?? req.user.location;

    delete f.location;
    const filter = {
      role_id: Roles.DOCTOR,
      ...f,
      //   ["license.location"]: {
      // $regex: new RegExp(filterLocation, "i"),
      //   },
    };

    filter["_id"] = {
      $in: (
        await ListAvailability({
          dateOfAppointment: appointmentTime ? new Date(appointmentTime) : null,
          ...filter,
        })
      )
        .filter((availability) => {
          if (!req.user.isCorporate) return true;
          return (availability.doctorId as IUser).isCorporate;
        })
        .map((a) => a.doctorId),
    };

    const {
      docs: doctors,
      total,
      totalPages,
      page,
      limit,
    } = await filterPaginate(User, filter, req.query);

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "MD list",
      doctors,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.log({ error });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};
