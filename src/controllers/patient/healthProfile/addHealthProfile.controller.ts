import { StatusCodes } from "http-status-codes";
import { ACTIVITY_LOG_TYPES } from "../../../../constant";
import HealthProfile from "../../../db/models/healthProfile.model";
import activityLog from "../../../services/activityLog";
// import { saveFile } from '../../../lib/saveFile';
import S3 from "../../../services/upload";
export const addHealthProfile = async (req, res) => {
  try {
    const healthProfile = await HealthProfile.create({
      ...req.body,
      userId: req.user._id,
    });
    const upload_data = {
      db_response: healthProfile,
      file: req.files[0],
    };
    const image_uri = await S3.uploadFile(upload_data);
    const response = await HealthProfile.findByIdAndUpdate(
      healthProfile._id,
      { $set: { profile_image: image_uri.Location } },
      { new: true }
    );
    // await saveFile(req.user, req);

    const tempArray = {};
    tempArray["oldData"] = null;
    tempArray["newData"] = response;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.CREATED,
      req,
      tempArray
    );
    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Health data added",
      data: {
        ...response.toObject(),
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(400).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};
