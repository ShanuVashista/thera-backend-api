import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import activityLog from "../../services/activityLog";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import Diagnosis from "../../db/models/diagnosis.model";
import Appointment from "../../db/models/appointment.model";
import { IAppointment } from "../../db/models/appointment.model";
import { IDiagnosis } from "../../db/models/diagnosis.model";

const createDiagnosis = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }
    const appointment: mongoose.Document<IAppointment> =
      await Appointment.findOne({
        doctorId: req.user._id,
        patientId: req.body.patientId,
      });

    if (!appointment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Appointment data between patient and doctor not found",
      });
    }

    const diagnosis = await Diagnosis.create({
      ...req.body,
      doctorId: req.user._id,
      appointmentId: appointment._id,
    });

    const tempArray = {};
    tempArray["oldData"] = null;
    tempArray["newData"] = diagnosis;

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
      message: "Diagnosis data added",
      data: {
        ...diagnosis.toObject(),
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

const updateDiagnosis = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }
    const appointment: mongoose.Document<IAppointment> =
      await Appointment.findOne({
        doctorId: req.user._id,
        patientId: req.body.patientId,
      });

    if (!appointment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Appointment data between patient and doctor not found",
      });
    }

    const diagnosis: mongoose.Document<IDiagnosis> = await Diagnosis.findOne({
      doctorId: req.user._id,
      _id: req.params.id,
    });

    if (!diagnosis) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Diagnosis data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = { ...diagnosis.toObject() };

    Object.entries(req.body).forEach(([key, value]) => {
      diagnosis[key] = value;
    });

    await diagnosis.save();

    tempArray["newData"] = diagnosis;
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
      message: "Diagnosis data updated",
      data: {
        ...diagnosis.toObject(),
      },
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

const listDiagnosis = async (req, res) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    let { page, limit, sort, cond } = req.body;

    if (user.role_id === "doctor") {
      cond = { doctorId: user._id, ...cond };
    }

    if (user.role_id === "patient") {
      cond = { patientId: user._id, ...cond };
    }

    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }
    if (!cond) {
      cond = {};
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }

    limit = parseInt(limit);
    // console.log(cond);
    const result = await Diagnosis.find(cond)
      .populate("doctorId")
      .populate("patientId")
      .populate("patientProfileId")
      .populate("appointmentId")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const result_count = await Diagnosis.find(cond).count();
    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Dignosis list Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result_count,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const listDiagnosisByPatientId = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }

    const user = JSON.parse(JSON.stringify(req.user));
    let { page, limit, sort, cond } = req.body;

    if (user.role_id === "doctor") {
      cond = { doctorId: user._id, patientId: req.body.patientId, ...cond };
    }

    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }
    if (!cond) {
      cond = {};
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }

    limit = parseInt(limit);
    // console.log(cond);
    const result = await Diagnosis.find(cond)
      .populate("doctorId")
      .populate("patientId")
      .populate("patientProfileId")
      .populate("appointmentId")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const result_count = await Diagnosis.find(cond).count();
    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Dignosis list Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result_count,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const getDiagnosis = async (req, res) => {
  try {
    let cond;

    if (req.user.role_id === "doctor") {
      cond = { doctorId: req.user._id, _id: req.params.id };
    }

    if (req.user.role_id === "patient") {
      cond = { patientId: req.user._id, _id: req.params.id };
    }

    const diagnosis = await Diagnosis.findOne(cond)
      .populate("doctorId")
      .populate("patientId")
      .populate("patientProfileId")
      .populate("appointmentId");

    if (!diagnosis) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Diagnosis data not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Diagnosis data found",
      diagnosis,
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

const deleteDiagnosis = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }

    const diagnosis = await Diagnosis.findOneAndDelete({
      doctorId: req.user._id,
      _id: req.params.id,
    });

    if (!diagnosis) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Diagnosis data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = diagnosis;
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
      message: "Diagnosis data deleted",
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

export default {
  createDiagnosis,
  updateDiagnosis,
  listDiagnosis,
  listDiagnosisByPatientId,
  getDiagnosis,
  deleteDiagnosis,
};
