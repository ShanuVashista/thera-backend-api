/* eslint-disable no-useless-escape */
// import { existsSync, mkdirSync, renameSync } from "fs";
import User from '../../db/models/user';
import { Roles } from "../../lib/roles";
import S3 from '../../services/upload';
import activityLog from "../../services/activityLog"
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import sickNoteModel from '../../db/models/sickNote.model';

const sickNote = async (req, res) => {
    try {
        //Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
         const registerData = req.body;
        const user = new sickNoteModel({ ...req.body, role_id: req.user.role_id });
        let data = await user.save();
        let tempArray = {}
        tempArray['oldData'] = null
        tempArray['newData'] = data
        let activityData = await activityLog.create(req.user._id, req.user.role_id, ACTIVITY_LOG_TYPES.CREATED, req, tempArray)
          

        res.status(201).json({
            status: true,
            type: 'success',
            message: 'Sick Note Inserted Successfully',
            data: {
                data
            }
        });
    } catch (error) {
            res.status(400).json({
                status: false,
                type: 'error',
                message: error.message
            });
    }
}
export default sickNote