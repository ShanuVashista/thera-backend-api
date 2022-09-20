import { StatusCodes } from "http-status-codes";
import { ACTIVITY_LOG_TYPES } from "../../../constant";
import PaymentMethod from "../../db/models/paymentMethod.model";
import { filterPaginate } from "../../lib/filterPaginate";
import { Roles } from "../../lib/roles";
import { PaymentMethodEnum } from "../../lib/PaymentMethodEnum";
import activityLog from "../../services/activityLog";

export const savePaymentMethod = async (req, res) => {
  try {
    if (req.user.role_id === Roles.DOCTOR) {
      if (req.body.type !== PaymentMethodEnum.BANK) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          type: "error",
          status: false,
          message: "Only bank payment method is allowed for doctor",
        });
      }
    }

    if (req.body.type === PaymentMethodEnum.HEALTH_CARD) {
      if (!req.user.isCorporate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          type: "error",
          status: false,
          message: "Only corporate user can use health card payment",
        });
      }
    }

    const paymentMethod = await PaymentMethod.create({
      ...req.body,
      userId: req.user._id,
    });

    const tempArray = {};
    tempArray["oldData"] = null;
    tempArray["newData"] = paymentMethod;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.CREATED,
      req,
      tempArray
    );

    if (!req.user.isBankDetails) {
      req.user.isBankDetails = true;
      await req.user.save({ validateBeforeSave: false });
    }

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Payment method saved",
      data: { paymentMethod },
    });
  } catch (error) {
    console.log({ error });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const getPaymentMethod = async (req, res) => {
  try {
    const { f = {} } = req.query;

    const filter = {
      userId: req.user._id,
      ...f,
    };

    const {
      docs: paymentMethods,
      total,
      totalPages,
      page,
      limit,
    } = await filterPaginate(PaymentMethod, filter, req.query);

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Payment method found",
      paymentMethods,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.log({ error });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!paymentMethod) {
      return res.status(StatusCodes.NOT_FOUND).json({
        type: "error",
        status: false,
        message: "Payment method not found",
      });
    }

    const tempArray = {};
    tempArray["oldData"] = paymentMethod;
    tempArray["newData"] = null;
    await activityLog.create(
      req.user?._id,
      req.user?.role_id,
      ACTIVITY_LOG_TYPES.DELETED,
      req,
      tempArray
    );

    await paymentMethod.remove();

    return res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Payment method deleted",
    });
  } catch (error) {
    console.log({ error });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};
