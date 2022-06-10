// import jwt from "jsonwebtoken";
// import validator from "email-validator";
import User from "../../db/models/user";
import activityLog from "../../services/activityLog";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import sendEmail from "../../services/sendEmail";
// import multer from 'multer';
// const upload = multer({ dest: 'public/' });
const Professional_PUT = async (req, res) => {
  try {
    const registerData = req.body;
    // registerData.isProfessionalInfo = true;
    req.user = JSON.parse(JSON.stringify(req.user));
    if (req.user.role_id != "doctor") {
      throw new Error("Doctor does not exist");
    }
    // const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
    // let cond = {};
    // if (typeof (req.query.id) == 'undefined' || req.query.id == null) {
    //     throw new Error('Missing doctor id');
    // } else {
    //     if (!checkForHexRegExp.test(req.query['id'] as string)) {
    //         throw new Error('Faild to match required pattern for Doctor Id');
    //     } else {
    //         cond = { '_id': req.query.id }
    //     }
    // }
    if (!registerData.specialty) {
      throw new Error("Please enter a specialty");
    }
    if (!registerData.qualification) {
      throw new Error("Please enter your qualification");
    }
    if (!registerData.total_exp) {
      throw new Error("Please enter your total experience");
    }
    if (!registerData.current_practise_address) {
      throw new Error("Please enter your current practise address");
    } else {
      if (registerData.current_practise_address.length == 0) {
        throw new Error("Please enter your current practise address");
      }
    }
    if (!registerData.license) {
      throw new Error("Please enter your license details");
    } else {
      if (registerData.license.length == 0) {
        throw new Error("Please enter your license details");
      }
    }
    // const user_count = await User.find(cond);
    // if (user_count.length == 0) {
    //     throw new Error("Doctor does't exist");
    // }else{
    //     if(user_count[0].role_id != 'doctor'){
    //         throw new Error("Doctor does't exist");
    //     }
    // }
    const admin = await User.findOne({
      _id: req.user._id,
    });
    const tempArray = {};
    tempArray["oldData"] = { ...admin.toObject() };

    registerData.isProfessionalInfo = true;

    const user = await User.findByIdAndUpdate(req.user._id, registerData, {
      new: true,
    });
    tempArray["newData"] = user;

    await activityLog.create(
      req.user._id,
      req.user.role_id,
      ACTIVITY_LOG_TYPES.UPDATED,
      req,
      tempArray
    );
    await sendEmail(user.email, "Successfully Added The Professional Info", "Congratulations!! your professional info is added successfully. Please wait for the admin approval.");
    
    res.status(200).json({
      status: true,
      type: "success",
      message: "Successfully submitted professional info",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};
export default Professional_PUT;
