import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import activityLog from "../../services/activityLog";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import MedicineModel from "../../db/models/medicine.model";
import { IMedicine } from "../../db/models/medicine.model";

const createMedicine = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }

    const medicine = await MedicineModel.create({
      ...req.body,
    });

    const tempArray = {};
    tempArray["oldData"] = null;
    tempArray["newData"] = medicine;

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
      message: "Medicine data added",
      data: {
        ...medicine.toObject(),
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

const updateMedicine = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }

    const medicine: mongoose.Document<IMedicine> = await MedicineModel.findOne({
      _id: req.params.id,
    });

    if (!medicine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Medicine data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = { ...medicine.toObject() };

    Object.entries(req.body).forEach(([key, value]) => {
      medicine[key] = value;
    });

    await medicine.save();

    tempArray["newData"] = medicine;
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
      message: "Medicine data updated",
      data: {
        ...medicine.toObject(),
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

const listMedicine = async (req, res) => {
  try {
    let { page, limit, sort } = req.body;

    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }

    limit = parseInt(limit);

    const result = await MedicineModel.find()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const result_count = await MedicineModel.find().count();
    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Medicine list Fetch Successfully",
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

const getMedicine = async (req, res) => {
  try {
    const medicine = await MedicineModel.findOne({ _id: req.params.id });

    if (!medicine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Medicine data not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Medicine data found",
      medicine,
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

const deleteMedicine = async (req, res) => {
  try {
    if (req.user.role_id !== "doctor") {
      throw new Error("You are not athorised to do this operation.");
    }

    const medicine = await MedicineModel.findOneAndDelete({
      doctorId: req.user._id,
      _id: req.params.id,
    });

    if (!medicine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Medicine data not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = medicine;
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
      message: "Medicine data deleted",
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
  createMedicine,
  updateMedicine,
  listMedicine,
  getMedicine,
  deleteMedicine,
};
