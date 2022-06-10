import SymtomList from "../../db/models/symtomList.model";
import Symtoms from "../../db/models/symtoms.model";
import { Response, NextFunction } from "express";

export const createSymtomps = async (req, res) => {
  const { symtom_name, specility_name } = req.body;

  const user = JSON.parse(JSON.stringify(req.user));
  if (user.role_id != "doctor") {
    return res.status(404).json({
      status: false,
      type: "success",
      message: "You are not authorise to create an Symtom",
    });
  }

  console.log("user", user);
  console.log("user", user._id);

  try {
    const symtom = await SymtomList.findOne({
      symtom_name: symtom_name,
    });

    if (symtom != null) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "Symtom is already in the list",
      });
    }

    const newSymtom = new SymtomList({
      symtom_name,
      specility_name,
    });

    await newSymtom.save();

    res.status(201).json({
      status: true,
      type: "success",
      data: newSymtom,
    });
  } catch (Err) {
    console.log("error", Err);

    res.status(404).json({
      status: false,
      message: "One Or More Required Field is empty",
    });
  }
};

// Get Symtom List Fetch Successfully",
export const getSymtoms = async (req, res: Response, next: NextFunction) => {
  try {
    // console.log("req", req.user);

    const user = JSON.parse(JSON.stringify(req.user));
    let { page, limit, sort, cond } = req.body;

    if (user.role_id === "doctor") {
      cond = { doctorId: user._id, ...cond };
    }

    if (user.role_id === "patient") {
      cond = { userId: user._id, ...cond };
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
    const result = await SymtomList.find(cond)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    const result_count = await SymtomList.find(cond).count();

    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Symtomps Fetch Successfully",
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

export const createDoctorSymtom = async (req, res) => {
  const { symtomId } = req.body;

  const user = JSON.parse(JSON.stringify(req.user));

  if (user.role_id != "doctor") {
    return res.status(404).json({
      status: false,
      type: "success",
      message: "You are not authorise to create an Symtom",
    });
  }

  try {
    const newSymtom = new Symtoms({
      symtomId,
      userId: user._id,
    });

    await newSymtom.save();

    res.status(201).json({
      status: true,
      type: "success",
      data: newSymtom,
    });
  } catch (Err) {
    console.log("error", Err);

    res.status(404).json({
      status: false,
      message: "Symtom name Required Field is empty",
    });
  }
};

export const getDoctorListBySymtom = async (req, res) => {
  const { symtomId } = req.body;

  try {
    const user = JSON.parse(JSON.stringify(req.user));
    let { page, limit, sort, cond } = req.body;

    if (user.role_id === "doctor") {
      cond = { doctorId: user._id, ...cond };
    }

    if (user.role_id === "patient") {
      cond = { userId: user._id, ...cond };
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
    const result = await Symtoms.find({ symtomId: symtomId }, cond)
      .populate("symtomId")
      .populate("userId")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    const result_count = await Symtoms.find(cond).count();

    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Symtomps Fetch Successfully",
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
