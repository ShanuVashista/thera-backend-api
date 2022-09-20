/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import User from "../../db/models/user";
import Token from "../../db/models/Password-reset-token";
import sendEmail from "../../services/sendEmail";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Joi from "joi";

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);

    if (error) return res.status(404).send(error.details[0].message);

    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .send({ message: "user with given email doesn't exist" });
    }

    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    // const link = `${process.env.BASE_URL}/user/password-reset/${user._id}/${token.token}`;
    function generatePassword() {
      let length = 8,
        charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
      for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal + "@";
    }
    const tempPass = generatePassword();

    user.password = tempPass;
    await user.save({ validateBeforeSave: false });
    // await token.delete();
    await sendEmail(
      user.email,
      "Here is your temprory created Password",
      tempPass
    );

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Temp Password",
      Password_Reset_Link: tempPass,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: "An Error Occured Please Try After Some Time!",
    });
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
  const pass_rgex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  try {
    const { password, confirmPassword } = req.body;

    const schema = Joi.object({
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("Invalid Link or expired");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send("Invalid Link or expired");

    if (!pass_rgex.test(password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    }
    if (password !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        type: "error",
        status: false,
        message: "Password didn't Match",
      });
    }

    user.password = password;
    await user.save({ validateBeforeSave: false });
    await token.delete();

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Password Changed!",
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: "An Error Occured!",
    });
  }
};

const changePassword = async (req, res: Response, next: NextFunction) => {
  //Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
  const pass_rgex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;

    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmNewPassword: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);

    if (!passwordIsValid) {
      return res.status(404).send({
        message: "Invalid Current Password!",
      });
    }

    if (!pass_rgex.test(newPassword)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "New Password and Confirm Password Is not same",
      });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Password changed successful",
      data: user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

const changeTempPassword = async (req, res) => {
  const pass_rgex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  try {
    const { email, tmp_password, new_password, confirm_password } = req.body;

    const schema = Joi.object({ email: Joi.string().email().required() });
    // const {error} = schema.validate(req.body);

    // if(error) return res.status(404).send(error.details[0].message);

    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .send({ message: "user with given email doesn't exist" });
    }

    const passwordIsValid = bcrypt.compareSync(tmp_password, user.password);
    if (!passwordIsValid) {
      return res.status(404).send({
        message: "Invalid Current Password!",
      });
    }

    if (!pass_rgex.test(new_password)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    }
    if (new_password !== confirm_password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "New Password and Confirm Password Is not same",
      });
    }

    user.password = new_password;
    await user.save({ validateBeforeSave: false });

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Password changed successful",
      data: user,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: err.message,
    });
  }
};

export default {
  forgotPassword,
  resetPassword,
  changePassword,
  changeTempPassword,
};
