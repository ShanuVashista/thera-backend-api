import { StatusCodes } from "http-status-codes";
import Faq from "../../db/models/faq.model";
import { filterPaginate } from "../../lib/filterPaginate";

export const getFaq = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.params.id) {
      const faq = await Faq.find().limit(5);

      if (!faq) {
        return res.status(StatusCodes.NOT_FOUND).json({
          type: "error",
          status: false,
          message: "Faq not found",
        });
      }

      console.log("1");

      res.status(StatusCodes.OK).json({
        type: "success",
        status: true,
        message: "Faq found",
        data: faq,
      });
    } else {
      const faq = await Faq.findOne({
        _id: id,
      });

      if (!faq) {
        return res.status(StatusCodes.NOT_FOUND).json({
          type: "error",
          status: false,
          message: "Faq not found",
        });
      }

      console.log("2");

      res.status(StatusCodes.OK).json({
        type: "success",
        status: true,
        message: "Faq found",
        data: faq,
      });
    }
  } catch (error) {
    console.log("Error in listing Faq", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};
