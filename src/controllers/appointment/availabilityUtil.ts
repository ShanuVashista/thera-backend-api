import { differenceInMinutes, addMinutes, subMinutes } from 'date-fns';
import { ObjectId } from 'mongodb';
import { MIN_MEETING_DURATION } from '../../../constant';
import Appointment from '../../db/models/appointment.model';
import Availability, {
  IAvailability,
} from '../../db/models/availability.model';

export async function checkAppointmentTimeConflict(
  dateOfAppointment: Date,
  {
    doctorId = '',
    patientId = '',
    ignoreAppointment = '',
  }: {
    doctorId?: string;
    patientId?: string;
    ignoreAppointment?: string | ObjectId;
  }
) {
  const filter = {
    $or: [
      {
        dateOfAppointment: {
          $gte: dateOfAppointment,
          $lte: addMinutes(dateOfAppointment, MIN_MEETING_DURATION),
        },
      },
      {
        dateOfAppointment: {
          $lte: dateOfAppointment,
          $gte: subMinutes(dateOfAppointment, MIN_MEETING_DURATION),
        },
      },
    ],
  };
  if (doctorId) {
    filter['doctorId'] = doctorId;
  }
  if (patientId) {
    filter['patientId'] = patientId;
  }
  if (ignoreAppointment) {
    filter['_id'] = { $ne: ignoreAppointment };
  }
  return await Appointment.findOne(filter);
}

export async function ListAvailability({
  dateOfAppointment = null,
  doctorId = '',
  patientId = '',
}: {
  dateOfAppointment?: Date;
  doctorId?: string;
  patientId?: string;
}) {
  const doctorIdFilter = doctorId ? { doctorId } : {};
  const patientIdFilter = patientId ? { patientId } : {};
  const dateOfAppointmentFilter = dateOfAppointment
    ? generateAvailabilityByTimeFilter(dateOfAppointment)
    : {};

  const filter = {
    ...doctorIdFilter,
    ...patientIdFilter,
    ...dateOfAppointmentFilter,
  };
  const availabilities = await Availability.find(filter).populate('doctorId');
  if (dateOfAppointment) {
    return filterTimeIsAvailable(availabilities, dateOfAppointment);
  }
  return availabilities;
}

export const generateAvailabilityByTimeFilter = (dateOfAppointment: Date) => ({
  start: {
    $lte: dateOfAppointment,
  },
  end: {
    $gte: dateOfAppointment,
  },
  $or: [
    {
      break_start: undefined,
    },
    {
      break_start: {
        $gt: dateOfAppointment,
      },
    },
    {
      break_end: {
        $lt: dateOfAppointment,
      },
    },
  ],
});

function filterTimeIsAvailable(
  availabilities: IAvailability[],
  dateOfAppointment: Date
) {
  return availabilities.filter((availability) => {
    if (
      Math.abs(differenceInMinutes(availability.end, dateOfAppointment)) <
      MIN_MEETING_DURATION
    ) {
      return false;
    }
    if (!availability.break_start) return true;
    if (
      Math.abs(
        differenceInMinutes(availability.break_start, dateOfAppointment)
      ) < MIN_MEETING_DURATION
    ) {
      return false;
    }
    return true;
  });
}
