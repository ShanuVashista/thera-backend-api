/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import referral from "../../db/models/referral.model";
import activityLog from "../../services/activityLog"

interface referral {
    doctorId: string,
    reasonForConsult: string,
    hpi: string,
    doctorsEmail: string
    patientId: string
}

// Function to Create an Appointment
const addReferral = async (
    req,
    res: Response,
    next: NextFunction
) => {
    // Get the data from query body
    const {
        reasonForConsult,
        hpi,
        doctorsEmail,
        patientId
    }: referral = req.body;
    try {
        let doctorId = req.user._id
        let doctorAdmin = req.user.role_id
        const newReferral = new referral({
            doctorId,
            reasonForConsult,
            hpi,
            doctorsEmail,
            patientId
        });
        let referralData = await newReferral.save();
        if (referralData) {
            let tempArray = {}
            tempArray['oldData'] = null
            tempArray['newData'] = referralData
            let activityData = await activityLog.create(req.user._id, req.user.role_id, ACTIVITY_LOG_TYPES.CREATED, req, tempArray)
            let condition = {
                _id: referralData._id
            }
            const data = await referral.find(condition).populate('patient_details').populate('doctor_details')
            res.status(201).json({
                status: true,
                type: "success",
                data: data
            })
        }
    } catch (Err) {
        console.log(Err);
        res.status(404).json({
            success: false,
            message: "One Or More Required Field is empty"
        })
    }
};


export default { addReferral };
