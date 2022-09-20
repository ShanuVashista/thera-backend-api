import { StatusCodes } from "http-status-codes";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import HealthProfile from "../../db/models/healthProfile.model";
import User from "../../db/models/user";
import { Roles } from "../../lib/roles";
import activityLog from "../../services/activityLog";

const healthData = async (req, res) => {
  try {
    const tempArray = {};
    tempArray["oldData"] = await User.findById(req.user._id);

    req.body.self = true;
    req.body.relation = "self";
    req.body.profile_image = req.user.profile_photo;
    req.body.name = req.user.firstname + " " + req.user.lastname;
    // req.userId= req.user._id;

    const healthData = await HealthProfile.create({
      ...req.body,
      userId: req.user._id,
    });

    req.body.isHealthDataInfo = true;
    req.body.healthProfileId = healthData._id;
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        role_id: Roles.PATIENT,
      },
      { ...req.body },
      { new: true }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "User not found",
      });
    }

    tempArray["newData"] = healthData;
    await activityLog.create(
      user?._id,
      user?.role_id,
      ACTIVITY_LOG_TYPES.UPDATED,
      req,
      tempArray
    );
    // req.body.isHealthCardInfo = true;
    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Health data updated",
      data: { user },
    });
  } catch (error) {
    // mongoose email exists error
    if (error.code === 11000) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        type: "error",
        status: false,
        message: "User already exists",
      });
    }
    console.log({ error });
    return res.status(400).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};
export default healthData;
