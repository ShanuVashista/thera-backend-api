/* eslint-disable no-useless-escape */
// import { existsSync, mkdirSync, renameSync } from "fs";
import StatusCodes from "http-status-codes";
import User from '../../db/models/user';
import S3 from '../../services/upload';
import activityLog from "../../services/activityLog"
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import sendEmail from "../../services/sendEmail";
const profileUpdate = async (req, res) => {
    try {
        const registerData = req.body;
        if(req.user.role_id != 'doctor'){
            return res.status(400).json({
                status: false,
                type: 'error',
                message: "You Are Not Authorized User"
            });
        }
        const admin = await User.findOne({
            _id: req.user._id
        })
        const tempArray = {};
        tempArray['oldData'] = admin
        
        const user = await User.findByIdAndUpdate({
            _id: req.user._id
        }, registerData);      
        
        tempArray['newData'] = registerData;
        await activityLog.create(
            req.user._id,
            req.user.role_id,
            ACTIVITY_LOG_TYPES.UPDATED,
            req,
            tempArray
        );
        await sendEmail(user.email, "Account Update Successfully", "Your account is successfully updated.");
        // user = JSON.parse(JSON.stringify(user));
        // const upload_user = {
        //     db_response: user,
        //     file: req.files[0]
        // }
        // const image_uri = await S3.uploadFile(upload_user);

        // const response = await User.findByIdAndUpdate(user._id, { $set: { "profile_photo": image_uri.Location } }, { new: true });

        res.status(StatusCodes.OK).json({
            status: true,
            type: 'success',
            message: 'Doctor Profile Updated Successfully',
            data: {
                user
            }
        });
    } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({
                status: false,
                type: 'error',
                message: error.message
            });
    }
}
export default profileUpdate