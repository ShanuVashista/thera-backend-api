import { StatusCodes } from "http-status-codes";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import PatientProfile from "../../db/models/patientProfile.model";
import { IPatientProfile } from "../../db/models/patientProfile.model";
import activityLog from "../../services/activityLog";
import S3 from "../../services/upload";
import mongoose from "mongoose";

const createPatientProfile = async (req, res) => {
  try {
    const profile_count = await PatientProfile.find({
      patientId: req.user._id,
    });

    if (profile_count.length != 0) {
      throw new Error("User already exist");
    }

    const patientProfile = await PatientProfile.create({
      ...req.body,
      patientId: req.user._id,
    });

    const upload_data = {
      db_response: patientProfile,
      file: req.files[0],
    };

    const image_uri = await S3.uploadFile(upload_data);
    const response = await PatientProfile.findByIdAndUpdate(
      patientProfile._id,
      { $set: { profile_image: image_uri.Location } },
      { new: true }
    );

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
      message: "Patient Health data added",
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

const deletePatientProfile = async (req, res) => {
  try {
    const patientProfile = await PatientProfile.findOneAndDelete({
      patientId: req.user._id,
      _id: req.params.id,
    });

    if (!patientProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Patient Health data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = patientProfile;
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
      message: "Patient Health data deleted",
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

const getPatientProfile = async (req, res) => {
  try {
    const patientProfile = await PatientProfile.findOne({
      patientId: req.user._id,
      _id: req.params.id,
    }).populate("patientId");

    if (!patientProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Patient Health data not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Patient Health data found",
      patientProfile,
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

const updatePatientProfile = async (req, res) => {
  try {
    const patientProfile: mongoose.Document<IPatientProfile> =
      await PatientProfile.findOne({
        patientId: req.user._id,
        _id: req.params.id,
      });

    if (!patientProfile) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Patient Health data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = { ...patientProfile.toObject() };

    Object.entries(req.body).forEach(([key, value]) => {
      patientProfile[key] = value;
    });

    await patientProfile.save();
    let response = {};

    if (typeof req.files != "undefined" && req.files != null) {
      const upload_data = {
        db_response: patientProfile,
        file: req.files[0],
      };
      await S3.deleteFile(JSON.parse(JSON.stringify(patientProfile)));

      const image_uri = await S3.uploadFile(upload_data);

      response = await PatientProfile.findByIdAndUpdate(
        patientProfile._id,
        { $set: { profile_image: image_uri.Location } },
        { new: true }
      );
    }

    tempArray["newData"] = patientProfile;
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
      message: "Patient Health data updated",
      response,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export default {
  createPatientProfile,
  deletePatientProfile,
  getPatientProfile,
  updatePatientProfile,
};
