import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ACTIVITY_LOG_TYPES } from "../../../../constant";
import HealthProfile, {
  IHealthProfile,
} from "../../../db/models/healthProfile.model";
import activityLog from "../../../services/activityLog";
// import { deleteFileByPath } from '../../../lib/deleteFileByPath';
import S3 from "../../../services/upload";

export const updateHealthProfile = async (req, res) => {
  try {
    const healthProfile: mongoose.dDocument<IHealthProfile> =
      await HealthProfile.findOne({
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
    tempArray["oldData"] = { ...healthProfile.toObject() };
    // const oldProfileImage = healthProfile.profile_image;

    // healthProfile.profile_image = req.file?.filename;
    Object.entries(req.body).forEach(([key, value]) => {
      healthProfile[key] = value;
    });

    await healthProfile.save();
    let response = {};
    if (typeof req.files != "undefined" && req.files != null) {
      const upload_data = {
        db_response: healthProfile,
        file: req.files[0],
      };
      await S3.deleteFile(JSON.parse(JSON.stringify(healthProfile)));
      const image_uri = await S3.uploadFile(upload_data);
      response = await HealthProfile.findByIdAndUpdate(
        healthProfile._id,
        { $set: { profile_image: image_uri.Location } },
        { new: true }
      );
    }

    // if (oldProfileImage) {
    //     const userDir = path.resolve(`./public/uploads/${req.user._id}`);
    //     const oldFilePath = path.join(userDir, oldProfileImage);

    //     await deleteFileByPath(oldFilePath);
    // }

    tempArray["newData"] = healthProfile;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.UPDATED,
      req,
      tempArray
    );
    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Health data updated",
      response,
    });
  } catch (error) {
    // console.log({ error });
    // deleteFileByPath(req.file?.path);
    return res.status(400).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};
