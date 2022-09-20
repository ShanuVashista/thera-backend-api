/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import clinicalNote from "../../db/models/clinicalNote.model";
import activityLog from "../../services/activityLog";

interface clinicalNote {
  doctorId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  patientId: string;
  eventOutcome: string;
}

// Function to Create an Appointment
const addClinicalNote = async (req, res: Response, next: NextFunction) => {
  // Get the data from query body
  const {
    subjective,
    objective,
    assessment,
    plan,
    patientId,
    eventOutcome,
  }: clinicalNote = req.body;
  try {
    let doctorId = req.user._id;
    let doctorAdmin = req.user.role_id;

    if (req.user.role_id != "doctor") {
      res.status(400).json({
        status: false,
        type: "Error",
        message: "You Are Not Authorized For Generate Clinical Note ",
      });
    } else {
      if (eventOutcome.length <= 0) {
        res.status(400).json({
          status: false,
          type: "Error",
          message: "Please Select Atleast One Checkbox",
        });
      } else {
        let eventOutcomeData = JSON.stringify(eventOutcome);
        const newClinicalNote = new clinicalNote({
          doctorId,
          subjective,
          objective,
          assessment,
          plan,
          patientId,
          eventOutcome: eventOutcomeData,
        });
        let clinicalNoteData = await newClinicalNote.save();
        if (clinicalNoteData) {
          let tempArray = {};
          tempArray["oldData"] = null;
          tempArray["newData"] = clinicalNoteData;
          let activityData = await activityLog.create(
            req.user._id,
            req.user.role_id,
            ACTIVITY_LOG_TYPES.CREATED,
            req,
            tempArray
          );
          let condition = {
            _id: clinicalNoteData._id,
          };
          const data = await clinicalNote
            .find(condition)
            .populate("patient_details")
            .populate("doctor_details");
          res.status(201).json({
            status: true,
            type: "success",
            data: data,
          });
        }
      }
    }
  } catch (Err) {
    console.log(Err);
    res.status(404).json({
      status: false,
      type: "Error",
      message: Err.message,
    });
  }
};

export default { addClinicalNote };
