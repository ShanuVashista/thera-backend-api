import { NextFunction, Request, Response } from "express";
import Note from "../../db/models/notes.model";

export interface Note {
  _id: string;
  title: string;
  text: string;
  isdeleted: boolean;
  appointmentId: string;
  doctorId: number;
  patientId: string;
}

const addNote = async (req, res: Response, next: NextFunction) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));

    // const {_id} = req.params;

    const { _id, appointmentId, patientId, title, text }: Note = req.body;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to create a Note",
      });
    }

    if (_id) {
      const doc = await Note.findById(_id);

      if (!doc) {
        res.status(404).json({
          status: false,
          message: "Note with this Id is not found",
        });
      }

      const update = {
        text: text,
        title: title,
      };

      await doc.updateOne(update);

      const updatedDoc = await Note.findById(_id);

      res.status(201).json({
        status: true,
        type: "success",
        data: updatedDoc,
        message: "Note Updated..."
      });
    } else {
      // Create a New Note
      const newNote = new Note({
        doctorId: user._id,
        appointmentId,
        patientId,
        title,
        text,
      });

      await newNote.save();

      res.status(201).json({
        status: true,
        type: "success",
        data: newNote,
        message:"New Note Created..."
      });
    }
  } catch (err) {
    res.status(404).json({
      status: false,
      message: "One Or More Required Field is empty",
    });
  }
};

const getNoteById = async (req, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await Note.findById(id);
    // .populate("patient")
    // .populate("doctor")
    // .populate("appointment")

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Note Fetched",
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const getNotes = async (req, res: Response, next: NextFunction) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));

    let { page, limit, sort, cond } = req.body;

    if (user.role_id === "patient") {
      return res.status(400).json({
        status: false,
        message: "You are not authorized",
      });
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
    const result = await Note.find(cond)
      .populate("doctor")
      .populate("patient")
      .populate("appointment")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const result_count = await Note.find(cond).count();
    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Appointment Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result_count,
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const getNotesByAppointment = async (
  req,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const { id } = req.params;

    let { page, limit, sort, cond,search } = req.body;

    
    if (user.role_id === "patient") {
      return res.status(400).json({
        status: false,
        message: "You are not authorized",
      });
    }

    if(search){
      cond = { appointmentId: id,title:{$regex:search},isdeleted:false, ...cond };
    }else{
      cond = { appointmentId: id, isdeleted:false, ...cond };
    }
    

    if (!page || page < 1) {
      page = 1;
    }
    // if (!limit) {
    //   limit = 10;
    // }
    if (!cond) {
      cond = {};
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }

    limit = parseInt(limit);
    // console.log(cond);

    const result = await Note.find(cond)
      .populate("doctor")
      //   .populate("patient")
      //   .populate("appointment")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    //   console.log(id)

    const result_count = await Note.find(cond).count();
    const totalPages = Math.ceil(result_count / limit);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Appointment Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result_count,
      data: result,
    });

    //   console.log(id)
  } catch (err) {
    res.status(404).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const deleteNote = async (req, res: Response, next: NextFunction) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));

    const { id } = req.params;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise user",
      });
    }

    const doc = await Note.findById(id);

    if (!doc) {
      res.status(404).json({
        status: false,
        message: "Note with this Id is not found",
      });
    }

    const update = {
      isdeleted: true,
    };

    await doc.updateOne(update);

    const updatedDoc = await Note.findById(id);

    res.status(201).json({
      status: true,
      type: "success",
      data: updatedDoc,
      message: "Note deleted Successfully.",
    });
  } catch (err) {
    res.status(404).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

export default {
  addNote,
  getNoteById,
  getNotes,
  getNotesByAppointment,
  deleteNote,
};
