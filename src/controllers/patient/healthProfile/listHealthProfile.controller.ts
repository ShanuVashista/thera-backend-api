import { StatusCodes } from "http-status-codes";
import HealthProfile from "../../../db/models/healthProfile.model";
import { filterPaginate } from "../../../lib/filterPaginate";

export const listHealthProfile = async (req, res) => {
  try {
    const { f = {} } = req.query;

    const filter = {
      userId: req.user._id,
      ...f,
    };

    const {
      docs: healthProfiles,
      total,
      totalPages,
      page,
      limit,
    } = await filterPaginate(HealthProfile, filter, req.query);

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Health data list",
      healthProfiles,
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
