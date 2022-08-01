import Message from "../../db/models/message.model";
import { StatusCodes } from "http-status-codes";

export const getMessages = async (req, res, next) => {
  try {
    const id = req.params.appoinmentId;

    const message = await Message.find({
      appointmentId: id,
    });

    if (!message) {
      return res
        .status(StatusCodes.OK)
        .json({
          type: "success",
          status: true,
          message: "Chat Message not found",
          data: "",
        })
        .sort({ createdAt: 1 });
    }
  } catch (err) {
    next(err);
    res.status(404).json({
      type: "error",
      status: false,
      message: "Message not found",
      error: err,
    });
  }
};

export const addMessage = async (req, res, next) => {
  try {
    const { appointmentId, userId, message } = req.body;

    if (
      appointmentId == "" ||
      appointmentId == null ||
      appointmentId == undefined
    ) {
      res.status(404).json({
        type: "error",
        status: false,
        message: "appointment id Is Required!",
      });
    }
    if (userId == "" || userId == null || userId == undefined) {
      res.status(404).json({
        type: "error",
        status: false,
        message: "User id Is Required!",
      });
    }

    const chatMessage = new Message({
      appointmentId,
      userId,
      message,
    });

    await chatMessage.save();

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Message Saved Sucessfully",
      data: chatMessage,
    });
  } catch (err) {
    next(err);
    res.status(404).json({
      type: "error",
      status: false,
      message: "Message not send",
      error: err,
    });
  }
};
