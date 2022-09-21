import { StatusCodes } from "http-status-codes";
import { ACTIVITY_LOG_TYPES } from "../../../../constant";
import HealthProfile from "../../../db/models/healthProfile.model";
import activityLog from "../../../services/activityLog";

export const deleteHealthProfile = async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findOneAndDelete({
      userId: req.user._id,
      _id: req.params.id,
    });

    if (!healthProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Health data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = healthProfile;
    tempArray["newData"] = null;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.DELETED,
      req,
      tempArray
    );
    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Health data deleted",
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
