import { StatusCodes } from "http-status-codes";
import { Roles } from "../lib/roles";

function userRole(role: Roles) {
  return (req, res, next) => {
    if (req.user.role_id !== role) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }
    next();
  };
}

export default userRole;
