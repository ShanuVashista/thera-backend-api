/* eslint-disable no-useless-escape */
import StatusCodes from "http-status-codes";
import Prescription from "../../db/models/prescription.model";
import Appointment from "../../db/models/appointment.model";
import activityLog from "../../services/activityLog";
import { ACTIVITY_LOG_TYPES } from "../../../constant";

const Prescription_POST = async (req, res) => {
  try {
    const prescriptionData = req.body;
    prescriptionData.doctor = req.user._id;
    const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    if (req.user.role_id != "doctor") {
      throw new Error("Doctor does not exist");
    }
    if (!checkForHexRegExp.test(prescriptionData.patient)) {
      throw new Error("Faild to match required pattern for Patient Id");
    }
    if (!checkForHexRegExp.test(prescriptionData.appointment)) {
      throw new Error("Faild to match required pattern for Appointment Id");
    } else {
      const appointment_count = await Appointment.find({
        _id: prescriptionData.appointment,
      });
      if (appointment_count.length == 0) {
        throw new Error("Appointment does not exist");
      } else {
        if (
          JSON.parse(JSON.stringify(appointment_count[0].doctorId)) !=
          JSON.parse(JSON.stringify(req.user._id))
        ) {
          throw new Error("Doctor is not belongs to this appointment");
        }
      }
    }
    if (
      typeof prescriptionData.prescription == "undefined" ||
      prescriptionData.prescription == null ||
      prescriptionData.prescription.length == 0
    ) {
      throw new Error("Prescription should contain some data");
    }
    const data = await Prescription.create(prescriptionData);

    const tempArray = {};
    tempArray["oldData"] = null;
    tempArray["newData"] = data;

    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.CREATED,
      req,
      tempArray
    );

    res.status(StatusCodes.CREATED).json({
      status: true,
      type: "success",
      message: "Prescription created successfully",
      data: data,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

const Prescription_PUT = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const prescription_id = req.params.id;
    const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    req.user = JSON.parse(JSON.stringify(req.user));

    if (typeof prescription_id == "undefined" || prescription_id == null) {
      throw new Error("Prescription id is missing");
    } else {
      if (!checkForHexRegExp.test(prescription_id)) {
        throw new Error("Faild to match required pattern for Prescription Id");
      } else {
        let prescription_count = await Prescription.find({
          _id: prescription_id,
        });

        prescription_count = JSON.parse(JSON.stringify(prescription_count));

        if (prescription_count.length == 0) {
          throw new Error("Prescription does not exist");
        }
        if (req.user.role_id != "doctor") {
          throw new Error("Doctor does not exist");
        }
        if (prescription_count[0].doctor != req.user._id) {
          throw new Error("This prescription is not belong to this doctor");
        }
      }
    }
    if (
      typeof prescriptionData.patient != "undefined" &&
      prescriptionData.patient != null
    ) {
      if (!checkForHexRegExp.test(prescriptionData.patient)) {
        throw new Error("Faild to match required pattern for Patient Id");
      }
    }
    if (
      typeof prescriptionData.prescription == "undefined" ||
      prescriptionData.prescription == null ||
      prescriptionData.prescription.length == 0
    ) {
      throw new Error("Prescription should contain some data");
    }

    const prescription_old = await Prescription.findOne({
      _id: prescription_id,
    });

    const data = await Prescription.findByIdAndUpdate(
      prescription_id,
      prescriptionData,
      { new: true }
    );

    const tempArray = {};
    tempArray["oldData"] = { ...prescription_old.toObject() };

    Object.entries(req.body).forEach(([key, value]) => {
      prescription_old[key] = value;
    });

    await prescription_old.save();

    tempArray["newData"] = data;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.UPDATED,
      req,
      tempArray
    );

    res.status(StatusCodes.OK).json({
      status: true,
      type: "success",
      message: "Prescription updated successfully",
      data: data,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

const Prescription_Renewal_PUT = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const prescription_id = req.params.id;
    const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    req.user = JSON.parse(JSON.stringify(req.user));

    if (req.user.role_id != "patient") {
      throw new Error("Patient does not exist");
    }
    if (typeof prescription_id == "undefined" || prescription_id == null) {
      throw new Error("Prescription id is missing");
    } else {
      if (!checkForHexRegExp.test(prescription_id)) {
        throw new Error("Faild to match required pattern for Appointment Id");
      } else {
        let prescription_count = await Prescription.find({
          _id: prescription_id,
        });
        prescription_count = JSON.parse(JSON.stringify(prescription_count));
        if (prescription_count.length == 0) {
          throw new Error("Prescription does not exist");
        }

        if (prescription_count[0].patient != req.user._id) {
          throw new Error("This prescription is not belong to this patient");
        }
      }
    }
    if (
      typeof prescriptionData.status == "undefined" ||
      prescriptionData.status == null
    ) {
      throw new Error("Prescription status is missing");
    }
    const prescription_old = await Prescription.findOne({
      _id: prescription_id,
    });

    const data = await Prescription.findByIdAndUpdate(
      prescription_id,
      { $set: { status: prescriptionData.status } },
      { new: true }
    );

    const tempArray = {};
    tempArray["oldData"] = { ...prescription_old.toObject() };

    Object.entries(req.body).forEach(([key, value]) => {
      prescription_old[key] = value;
    });

    await prescription_old.save();

    tempArray["newData"] = data;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.UPDATED,
      req,
      tempArray
    );

    res.status(StatusCodes.OK).json({
      status: true,
      type: "success",
      message: "Successfully chnage the Prescription status to renewal",
      data: data,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

const Prescription_List_POST = async (req, res) => {
  try {
    let { page, limit, sort, cond } = req.body;
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

    const prescription = await Prescription.find(cond)
      .populate("patient_details")
      .populate("doctor_details")
      .populate("appointment_details")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const prescription_count = await Prescription.find(cond).count();

    const totalPages = Math.ceil(prescription_count / limit);

    res.status(StatusCodes.OK).send({
      status: true,
      type: "success",
      message: "Prescription List Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: prescription_count,
      data: prescription,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

const getPrescription = async (req, res) => {
  try {
    let cond;

    if (req.user.role_id === "doctor") {
      cond = { doctor: req.user._id, _id: req.params.id };
    }

    if (req.user.role_id === "patient") {
      cond = { patient: req.user._id, _id: req.params.id };
    }

    const prescription = await Prescription.findOne(cond).populate(
      "appointment"
    );

    if (!prescription) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Prescription data not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Prescription data found",
      prescription,
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

const deletePrescription = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }

    const prescription = await Prescription.findOneAndDelete({
      doctorId: req.user._id,
      _id: req.params.id,
    });

    if (!prescription) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Prescription data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = prescription;
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
      message: "Prescription data deleted",
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
  Prescription_POST,
  Prescription_PUT,
  Prescription_Renewal_PUT,
  Prescription_List_POST,
  getPrescription,
  deletePrescription,
};
