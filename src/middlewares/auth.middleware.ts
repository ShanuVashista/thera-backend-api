import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../db/models/user";

export default async function auth(req, res, next) {
  try {
    if (
      typeof req.header("Authorization") == "undefined" ||
      req.header("Authorization") == null
    ) {
      throw new Error("Token not found");
    }
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        type: "error",
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // console.log(error.message,'---jwt error');
    if (error.message == "invalid signature") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        type: "error",
        message: "Invalid token",
      });
    } else {
      if (error.message == "jwt malformed") {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: false,
          type: "error",
          message: "Token is not valid",
        });
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: false,
          type: "error",
          message: error.message,
        });
      }
    }
  }
}
