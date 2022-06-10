/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
// import jwt from "jsonwebtoken";
import StatusCodes from "http-status-codes";
import User from '../../db/models/user';
const Count_User = async (req, res) => {
    try {
        if (req.user.role_id == 'admin') {
            const cond = [
                {
                    $facet: {
                        corporate_doctor: [{
                            $match: { isCorporate: true, role_id: "doctor" }
                        }, {
                            $count: 'count'
                        }],
                        pending_doctor: [{
                            $match: { isApproved: false, role_id: "doctor" }
                        }, {
                            $count: 'count'
                        }],
                        approved_doctor: [{
                            $match: { isApproved: true, role_id: "doctor" }
                        }, {
                            $count: 'count'
                        }],
                        total_doctor: [{
                            $match: { role_id: "doctor" }
                        }, {
                            $count: 'count'
                        }],
                        corporate_patient: [{
                            $match: { isCorporate: true, role_id: "patient" }
                        }, {
                            $count: 'count'
                        }],
                        pending_patient: [{
                            $match: { isApproved: false, role_id: "patient" }
                        }, {
                            $count: 'count'
                        }],
                        total_patient: [{
                            $match: { role_id: "patient" }
                        }, {
                            $count: 'count'
                        }]
                    }
                }
            ]
            let user = await User.aggregate(cond)
            res.status(StatusCodes.OK).send({
                status: true,
                type: 'success',
                message: "User Count Fetch Successfully",
                data: user,
            });
        } else {
            res.status(400).send({
                status: false,
                type: 'error',
                message: "You Are Not Authorized User"
            });
        }


    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            type: 'error',
            message: error.message
        });
    }
}
export default Count_User