/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isBefore } from "date-fns";
import { Request, Response, NextFunction } from "express";
import Appointment from "../../db/models/appointment.model";
import User from "../../db/models/user";
import sendEmail from "../../services/sendEmail";
import {
  ListAvailability,
  checkAppointmentTimeConflict,
} from "./availabilityUtil";
import StatusCodes from "http-status-codes";
import mongoose from "mongoose";
export interface Appointment {
  userId: number;
  patientId: number;
  appointmentId: number;
  symptoms: Array<string>;
  createdAt: Date;
  doctorId: string;
  doctor: number;
  dateOfAppointment: string;
  appointmentType: string;
}

//getting all Appointments
const getAppointments = async (req, res: Response, next: NextFunction) => {
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
    const result = await Appointment.find(cond)
      .populate("doctor_details")
      .populate("user_details")
      .populate("patient_details")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    const result_count = await Appointment.find(cond).count();
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
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// Get Appointment By ID
const getAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { Appointmentid } = req.params;

    const result = await Appointment.findById(Appointmentid)
      .populate("patient_details")
      .populate("user_details")
      .populate("doctor_details");

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Appointment List Fetched",
      data: result,
    });
  } catch (Err) {
    // console.log(Err);
    res.status(404).json({
      statue: false,
      type: "error",
      message: "Appointment not found",
    });
  }
};

// Update an Appointment By ID
const updateAppointment = async (req, res: Response, next: NextFunction) => {
  try {
    const { Appointmentid } = req.params;

    const doc = await Appointment.findById(Appointmentid);

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Appointment not found",
      });
    }

    const {
      isEmergency,
      dateOfAppointment = doc.dateOfAppointment.toISOString(),
    }: { [key: string]: string } = req.body;

    if (isBefore(new Date(dateOfAppointment), new Date())) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You can not create an Appointment in the past",
      });
    }

    const doctorAvailability = await ListAvailability({
      dateOfAppointment: new Date(dateOfAppointment),
      doctorId: doc.doctorId.toString(),
    });

    if (doctorAvailability.length === 0) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "Doctor is not available on this date",
      });
    }

    console.log({ doctorAvailability });

    const appointmentTimeConflict = await checkAppointmentTimeConflict(
      new Date(dateOfAppointment),
      { doctorId: doc.doctorId.toString(), ignoreAppointment: doc._id }
    );

    if (appointmentTimeConflict) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "This time slot is already booked",
      });
    }

    const update = {
      isEmergency: isEmergency,
      dateOfAppointment: dateOfAppointment,
    };
    await doc.updateOne(update);

    const updateDoc = await Appointment.findById(Appointmentid);

    await sendEmail(
      (
        await User.findById(updateDoc.userId)
      ).email,
      "Appointment Updated",
      "",
      `Your appointment has been updated. Please check your appointment details.`
    );
    return res.status(200).json({
      status: true,
      type: "success",
      message: "Appointment Updated Sucessfully",
      data: updateDoc,
    });
  } catch (Err) {
    console.log(Err);
    res.status(404).json({
      type: "error",
      status: false,
      message: "Appointment not found",
    });
  }
};

// Delete Appointment ById
const deleteAppointment = async (req, res: Response, next: NextFunction) => {
  try {
    const { Appointmentid } = req.params;

    const doc = await Appointment.findById(Appointmentid);

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Appointment not found",
      });
    }

    const result = await Appointment.deleteOne({ _id: Appointmentid });

    await sendEmail(
      (
        await User.findById(doc.userId)
      ).email,
      "Appointment Cancelled",
      "",
      `Your appointment has been cancelled. Please check your appointment details.`
    );
    return res.status(200).json({
      status: true,
      type: "success",
      message: "Appointment Delete Successful",
    });
  } catch (Err) {
    // console.log(Err);
    res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }
};

// Function to Create an Appointment
const addAppointment = async (req, res: Response, next: NextFunction) => {
  // Get the data from query body
  const {
    doctorId,
    patientId,
    appointmentType,
    dateOfAppointment,
    symptoms,
  }: Appointment = req.body;

  const user = JSON.parse(JSON.stringify(req.user));
  if (user.role_id != "patient") {
    return res.status(404).json({
      status: false,
      type: "success",
      message: "You are not authorise to create an Appointment",
    });
  }

  try {
    if (isBefore(new Date(dateOfAppointment), new Date())) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You can not create an Appointment in the past",
      });
    }

    const doctorAvailability = await ListAvailability({
      dateOfAppointment: new Date(dateOfAppointment),
      doctorId,
    });

    if (doctorAvailability.length === 0) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "Doctor is not available on this date",
      });
    }

    const appointmentTimeConflict = await checkAppointmentTimeConflict(
      new Date(dateOfAppointment),
      { doctorId }
    );

    if (appointmentTimeConflict) {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "This time slot is already booked",
      });
    }

    const newAppointment = new Appointment({
      userId: user._id,
      patientId,
      symptoms,
      doctorId,
      appointmentType,
      dateOfAppointment,
    });
    await newAppointment.save();

    await sendEmail(
      req.user.email,
      "Appointment Created",
      "",
      `
    <h1>Appointment Created</h1>
    <p>Your Appointment has been created successfully</p>
    <p>Please visit your dashboard to view the appointment details</p>`
    );
    res.status(201).json({
      status: true,
      type: "success",
      data: newAppointment,
    });
  } catch (Err) {
    // console.log(Err);
    res.status(404).json({
      status: false,
      message: "One Or More Required Field is empty",
    });
  }
};

// Get Appointment Count
const Count_Appointment = async (req, res) => {
  try {
    if (req.user.role_id == "admin") {
      const cond = [
        {
          $facet: {
            upcoming_appointment: [
              {
                $match: {
                  dateOfAppointment: { $gte: new Date() },
                  status: "Approved",
                },
              },
              {
                $count: "count",
              },
            ],
            reject_appointment: [
              {
                $match: { status: "Rejected" },
              },
              {
                $count: "count",
              },
            ],
            complete_appointment: [
              {
                $match: { status: "Completed" },
              },
              {
                $count: "count",
              },
            ],
          },
        },
      ];
      let appointment = await Appointment.aggregate(cond);
      res.status(StatusCodes.OK).send({
        status: true,
        type: "success",
        message: "Appointment Count Fetch Successfully",
        data: appointment,
      });
    } else {
      res.status(400).send({
        status: false,
        type: "error",
        message: "You Are Not Authorized User",
      });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

// Get Appointment Count For Thera
const Count_Appointment_Thera = async (req, res) => {
  try {
    let condition = {};
    if (req.user.role_id == "doctor") {
      condition = { doctorId: new mongoose.Types.ObjectId(req.user._id) };
    }
    if (req.user.role_id == "patient") {
      condition = { userId: new mongoose.Types.ObjectId(req.user._id) };
    }

    const cond = [
      {
        $match: condition,
      },
      {
        $facet: {
          upcoming_appointment: [
            {
              $match: {
                dateOfAppointment: { $gte: new Date() },
                status: "Approved",
              },
            },
            {
              $count: "count",
            },
          ],
          reject_appointment: [
            {
              $match: { status: "Rejected" },
            },
            {
              $count: "count",
            },
          ],
          complete_appointment: [
            {
              $match: { status: "Completed" },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ];
    let appointment = await Appointment.aggregate(cond);
    res.status(StatusCodes.OK).send({
      status: true,
      type: "success",
      message: "Appointment Count Fetch Successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};
export default {
  getAppointments,
  addAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  Count_Appointment,
  Count_Appointment_Thera,
};
