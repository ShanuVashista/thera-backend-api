import { StatusCodes } from "http-status-codes";
import Message from "../../db/models/message.model";
import Appointment from "../../db/models/appointment.model";

export const getMessageByAppointmentId = async (req, res) => {
  try {
    const id = req.params.appoinmentId;

    const message = await Message.find({
      appointmentId: id,
    });

    if (!message) {
      return res.status(StatusCodes.OK).json({
        type: "success",
        status: true,
        message: "Chat Message not found",
        data: "",
      });
    }

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Faq found",
      data: message,
    });
  } catch (error) {
    console.log("Error in listing Message", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const getAppointmentList = async (req, res) => {
  try {
    const message = await Appointment.find();

    if (!message) {
      return res.status(StatusCodes.OK).json({
        type: "success",
        status: true,
        message: "Chat Message not found",
        data: "",
      });
    }

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Faq found",
      data: message,
    });
  } catch (error) {
    console.log("Error in listing Message", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const updateMessageRecivedStatus = async (req, res) => {
  try {
    const { messageId } = req.params;

    const newMessage = await Message.findById({ _id: messageId });

    if (!newMessage) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Message not found",
      });
    }

    const update = {
      received: true,
      seen: false,
    };

    await newMessage.updateOne(update);

    const updateMessage = await Message.findById(messageId);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Message Status Updated Sucessfully",
      data: updateMessage,
    });
  } catch (Err) {
    console.log(Err);
    res.status(404).json({
      type: "error",
      status: false,
      message: "Message not found",
    });
  }
};

export const updateMessageSeenStatus = async (req, res) => {
  try {
    const { messageId } = req.params;

    const newMessage = await Message.findById({ _id: messageId });

    if (!newMessage) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Message not found",
      });
    }

    const update = {
      seen: true,
    };

    await newMessage.updateOne(update);

    const updateMessage = await Message.findById(messageId);

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Message Status Updated Sucessfully",
      data: updateMessage,
    });
  } catch (Err) {
    console.log(Err);
    res.status(404).json({
      type: "error",
      status: false,
      message: "Message not found",
    });
  }
};

export const sendMessage = async (req, res) => {
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
  } catch (Err) {
    res.status(404).json({
      type: "error",
      status: false,
      message: "Message not found",
    });
  }
};
