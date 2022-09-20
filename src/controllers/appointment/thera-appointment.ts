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
  description: string;
}
const addAppointment = async (req, res: Response, next: NextFunction) => {
  // Get the data from query body
  const {
    doctorId,
    patientId,
    appointmentType,
    dateOfAppointment,
    symptoms,
    description,
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

    // const doctorAvailability = await ListAvailability({
    //     dateOfAppointment: new Date(dateOfAppointment),
    //     doctorId,
    // });

    // if (doctorAvailability.length === 0) {
    //     return res.status(404).json({
    //         status: false,
    //         type: 'success',
    //         message: 'Doctor is not available on this date',
    //     });
    // }

    // const appointmentTimeConflict = await checkAppointmentTimeConflict(
    //     new Date(dateOfAppointment),
    //     { doctorId }
    // );
    //
    // if (appointmentTimeConflict) {
    //     return res.status(404).json({
    //         status: false,
    //         type: 'success',
    //         message: 'This time slot is already booked',
    //     });
    // }

    const newAppointment = new Appointment({
      userId: user._id,
      patientId,
      symptoms,
      doctorId,
      appointmentType: "virtual",
      dateOfAppointment,
      description: description,
      status: "Approved",
    });
    await newAppointment.save();

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

export default {
  addAppointment,
};
