import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

const getConnection = async (req, res, next) => {
  if (!process.env.DATABASE_URI) {
    throw new Error("Database URI not found");
  }

  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Database Connected to the MongoDB");
    next();
  } catch (error) {
    console.log("Error in connecting to the MongoDB", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: "Failed in Database Connection",
        status: false,
        error: error,
      })
      .end();
  }
};
export default getConnection;
