import { StatusCodes } from 'http-status-codes';
import { differenceInMinutes, subMinutes } from 'date-fns';
import Appointment from '../../db/models/appointment.model';
import { AppointmentStatuses } from '../../lib/appointmentStatuses';
import { getSlotIndex, getSlots } from '../../lib/utils/timeSlots';
import Availability from '../../db/models/availability.model';
import { generateAvailabilityByTimeFilter } from './availabilityUtil';
import { MIN_MEETING_DURATION } from '../../../constant';

export const waitList = async (req, res) => {
  try {
    const appointmentData = await Appointment.find({
      userId: req.user._id,
      status: AppointmentStatuses.APPROVED,
      dateOfAppointment: {
        $gte: subMinutes(new Date(), MIN_MEETING_DURATION),
      }
    })
      .sort({ dateOfAppointment: 1 })
      .limit(1);

    if (appointmentData.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: 'error',
        status: false,
        message: 'No appointment found',
      });
    }

    const appointment = await Appointment.findOne({
      userId: req.user._id,
      _id: appointmentData[0]._id,
    });

    appointment.dateOfAppointment.setSeconds(0, 0);

    const availability = await Availability.findOne({
      doctorId: appointment.doctorId,
      ...generateAvailabilityByTimeFilter(appointment.dateOfAppointment),
    });

    if (availability === null) {
      return res.status(StatusCodes.OK).json({
        type: 'success',
        status: true,
        message: 'Doctor Not Available At booked Time Schedule',
      });
    }

    const start =
      availability.start ?? new Date(appointment.dateOfAppointment.getTime());
    const end =
      availability.end ?? new Date(appointment.dateOfAppointment.getTime());
    if (!availability) {
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
    }
    const slots = getSlots(start, end, 30);

    const appointments = await Appointment.find({
      doctorId: appointment.doctorId,
      dateOfAppointment: {
        $gte: start,
        $lt: appointment.dateOfAppointment,
      },
    }).sort({ dateOfAppointment: 1 });

    // filter out completed appointments
    const precedingAppointments = appointments.filter(
      (appointment) => appointment.status === AppointmentStatuses.APPROVED
    );

    // find in progress appointment
    const inProgressAppointment = precedingAppointments.find(
      (appointment) => appointment.status === AppointmentStatuses.IN_PROGRESS
    );

    const slotIndexOfInProgressAppointment = getSlotIndex(
      slots,
      inProgressAppointment?.dateOfAppointment
    );
    const slotIndexOfAppointment = getSlotIndex(
      slots,
      appointment.dateOfAppointment
    );

    const precidingAppointmentCompletionTime =
      precedingAppointments.length * 30;
    // calculate estimated wait time
    const estimatedWaitTime = inProgressAppointment
      ? precidingAppointmentCompletionTime + MIN_MEETING_DURATION
      : Math.max(
        0,
        differenceInMinutes(appointment.dateOfAppointment, new Date())
      );

    return res.status(StatusCodes.OK).json({
      type: 'success',
      status: true,
      message: 'Appointment found',
      data: { appointment },
      est: estimatedWaitTime,
      inProgressAppointment: inProgressAppointment
        ? slotIndexOfInProgressAppointment + 1
        : null,
      appointment: slotIndexOfAppointment + 1,
    });
  } catch (error) {
    console.log({ error });
    return res.status(400).json({
      type: 'error',
      status: false,
      message: error.message,
    });
  }
};
