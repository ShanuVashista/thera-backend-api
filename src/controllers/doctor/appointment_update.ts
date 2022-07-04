import Appointment from "../../db/models/appointment.model";
import User from "../../db/models/user";
import sendEmail from "../../services/sendEmail";

const Doctor_Appointment_PUT = async (req, res) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    if (user.role_id != "doctor") {
      throw new Error("Doctor does not exist");
    }
    const body = req.body;
    if (
      typeof body.appointment_id == "undefined" ||
      body.appointment_id == null
    ) {
      throw new Error("Appointment Id is missing");
    }
    if (!checkForHexRegExp.test(body.appointment_id)) {
      throw new Error("Faild to match required pattern for Appointment Id");
    }
    if (typeof body.status == "undefined" || body.status == null) {
      throw new Error("Appointment Status is missing");
    }
    let appointment_count = await Appointment.find({
      _id: body.appointment_id,
    });
    appointment_count = JSON.parse(JSON.stringify(appointment_count));
    if (appointment_count.length == 0) {
      throw new Error("Appointment does not exist");
    }
    if (appointment_count[0]?.doctorId !== user._id) {
      throw new Error("Doctor is not associated with this Appointment");
    }
    if (appointment_count[0].status == "Rejected") {
      throw new Error("This Appointment is not allow to update the status");
    }
    if (appointment_count[0].status == body.status) {
      throw new Error(`This Appointment status is already ${body.status}`);
    }
    const appointment_update = await Appointment.findByIdAndUpdate(
      body.appointment_id,
      { $set: { status: body.status } },
      { new: true }
    );

    await sendEmail(
      (
        await User.findById(appointment_update.userId)
      )?.email,
      "Appointment Status",
      `Your appointment status is ${body.status}`
    );

    res.status(200).json({
      status: true,
      type: "success",
      message: "Appointment update successfully",
      data: appointment_update,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};
export default Doctor_Appointment_PUT;
