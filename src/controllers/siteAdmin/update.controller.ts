import { StatusCodes } from "http-status-codes";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import User from "../../db/models/user";
import { Roles } from "../../lib/roles";
import S3 from '../../services/upload';
import activityLog from "../../services/activityLog";

export const updateAdmin = async (req, res) => {
    try {
        // console.log(req.user,'user details--------');
        
        let admin = await User.findOne({
            _id: req.user.id,
            role_id: Roles.ADMIN
        })
        // console.log(admin,'admin=-=-=--');
        admin = JSON.parse(JSON.stringify(admin));
        if (!admin) {
            return res.status(StatusCodes.NOT_FOUND).json({
                type: "error",
                status: false,
                message: "User Not Found"
            })
        }

        const tempArray = {};
        tempArray['oldData'] = admin;

        // Object.entries(req.body).forEach(([key, value]) => {
        //     admin[key] = value;
        // });
        // console.log(admin,'--------------');
        
        // await admin.save();
        admin = await User.findByIdAndUpdate({_id:admin._id},req.body,{new:true})
        let response = {};
        if(typeof (req.files) != 'undefined' && req.files != null){
            const upload_data = {
                db_response: admin,
                file: req.files[0]
            }
            await S3.deleteFile(JSON.parse(JSON.stringify(admin)));
            const image_uri = await S3.uploadFile(upload_data);
            response = await User.findByIdAndUpdate(admin._id, { $set: { "profile_photo": image_uri.Location } }, { new: true });
        }

        tempArray['newData'] = admin;
        await activityLog.create(
            req.user?._id,
            req.user?.role_id,
            ACTIVITY_LOG_TYPES.UPDATED,
            req,
            tempArray
        );

        return res.status(StatusCodes.OK).json({
            type: "success",
            status: true,
            message: "Admin Updated",
            data: response
        });
    } catch (Err) {
        console.log(Err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: 'Admin not found',
        });
    }
};
