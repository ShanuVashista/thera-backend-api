/* eslint-disable no-useless-escape */
import StatusCodes from "http-status-codes";
import Prescription from "../../db/models/prescription.model";
// import User from '../../db/models/user';
const Prescription_Renewal_PUT = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const prescription_id = req.query;
    const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
    req.user = JSON.parse(JSON.stringify(req.user));
    if (req.user.role_id != "patient") {
      throw new Error("Patient does not exist");
    }
    if (
      typeof prescription_id.id == "undefined" ||
      prescription_id.id == null
    ) {
      throw new Error("Prescription id is missing");
    } else {
      if (!checkForHexRegExp.test(prescription_id.id)) {
        throw new Error("Faild to match required pattern for Appointment Id");
      } else {
        let prescription_count = await Prescription.find({
          _id: prescription_id.id,
        });
        prescription_count = JSON.parse(JSON.stringify(prescription_count));
        if (prescription_count.length == 0) {
          throw new Error("Prescription does not exist");
        }

        if (prescription_count[0].patient != req.user._id) {
          throw new Error("This prescription is not belong to this patient");
        }
      }
    }
    if (
      typeof prescriptionData.status == "undefined" ||
      prescriptionData.status == null
    ) {
      throw new Error("Prescription status is missing");
    }
    const data = await Prescription.findByIdAndUpdate(
      prescription_id.id,
      { $set: { status: prescriptionData.status } },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      status: true,
      type: "success",
      message: "Successfully chnage the Prescription status to renewal",
      data: data,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};
export default Prescription_Renewal_PUT;
