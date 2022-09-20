import StatusCodes from "http-status-codes";
import Activity from "../../db/models/activityLogs.model";

const List_POST = async (req, res) => {
  try {
    if (req.user.role_id == "admin") {
      let { page, limit, sort, cond } = req.body;
      if (!page || page < 1) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      if (!cond) {
        cond = {};
      }
      if (!sort) {
        sort = { createdAt: -1 };
      }
      limit = parseInt(limit);
      const rate = await Activity.find(cond)
        .populate("user_details")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
      const rate_count = await Activity.find(cond).count();
      const totalPages = Math.ceil(rate_count / limit);
      res.status(StatusCodes.OK).send({
        status: true,
        type: "success",
        message: "Activity List Fetch Successfully",
        page: page,
        limit: limit,
        totalPages: totalPages,
        total: rate_count,
        data: rate,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        type: "error",
        message: "You are not authorized",
      });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};
export default { List_POST };
