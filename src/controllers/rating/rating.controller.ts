/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
import StatusCodes from "http-status-codes";
import User from '../../db/models/user';
import RateSchema from '../../db/models/rating.model';
const Doctor_POST = async (req, res) => {
    try {
        const rating_details = req.body;
        const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
        req.user = JSON.parse(JSON.stringify(req.user));
        if (req.user.role_id != 'patient') {
            throw new Error('Doctor can only be rated by Patient');
        } else {
            rating_details.rater = req.user._id;
        }
        if (typeof (rating_details.doctor) != undefined && rating_details.doctor != null) {
            if (!checkForHexRegExp.test(rating_details.doctor)) {
                throw new Error('Faild to match required pattern for Doctor Id');
            } else {
                const doctor_count = await User.find({ '_id': rating_details.doctor, 'role_id': 'doctor' }).count();
                if (doctor_count == 0) {
                    throw new Error('Doctor does not exist');
                }
            }
        } else {
            throw new Error('Doctor Id is missing');
        }
        if (typeof (rating_details.rating) != undefined && rating_details.rating != null) {
            if (typeof (rating_details.rating) !== 'number') {
                throw new Error('Rating must be a number');
            } else {
                if (rating_details.rating > 5 || rating_details.rating < 0) {
                    throw new Error('Rating should be 0 to 5');
                }
            }
        } else {
            throw new Error('Rating is missing');
        }
        if (typeof (rating_details.type) != undefined && rating_details.type != null) {
            if (rating_details.type != 'doctor') {
                throw new Error('Rating type is inappropriate');
            }
        } else {
            throw new Error('Rating type is missing');
        }
        const data = await RateSchema.create(rating_details);
        res.status(StatusCodes.OK).json({
            status:true,
            type: 'success',
            message: "Thanks for rating",
            data: data
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            type: 'error',
            message: error.message
        });
    }
}
const Application_POST = async (req, res) => {
    try {
        const rating_details = req.body;
        req.user = JSON.parse(JSON.stringify(req.user));
        rating_details.rater = req.user._id;
        if (typeof (rating_details.doctor) != undefined && rating_details.doctor != null) {
            throw new Error('Doctor is not accepted for Application rating');
        }
        if (typeof (rating_details.rating) != undefined && rating_details.rating != null) {
            if (typeof (rating_details.rating) !== 'number') {
                throw new Error('Rating must be a number');
            } else {
                if (rating_details.rating > 5 || rating_details.rating < 0) {
                    throw new Error('Rating should be 0 to 5');
                }
            }
        } else {
            throw new Error('Rating is missing');
        }
        if (typeof (rating_details.type) != undefined && rating_details.type != null) {
            if (rating_details.type != 'application') {
                throw new Error('Rating type is inappropriate');
            }
        } else {
            throw new Error('Rating type is missing');
        }
        const data = await RateSchema.create(rating_details);
        res.status(StatusCodes.OK).json({
            status:true,
            type: 'success',
            message: "Thanks for rating",
            data: data
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            type: 'error',
            message: error.message
        });
    }
}
const List_POST = async (req, res) => {
    try {
        let { page, limit, sort, cond } = req.body;
        if (!page || page < 1) {
            page = 1;
        }
        if (!limit) {
            limit = 10;
        }
        if (!cond) {
            cond = {}
        }
        if (!sort) {
            sort = { "createdAt": -1 }
        }
        limit = parseInt(limit);
        const rate = await RateSchema.find(cond).populate('doctor_details').populate('rater_details').sort(sort).skip((page - 1) * limit).limit(limit)
        const rate_count = await RateSchema.find(cond).count()
        const totalPages = Math.ceil(rate_count / limit);
        res.status(StatusCodes.OK).send({
            status:true,
            type: 'success',
            message: "Rating List Fetch Successfully",
            page: page,
            limit: limit,
            totalPages: totalPages,
            total: rate_count,
            data: rate,
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            type: 'error',
            message: error.message
        });
    }
}
export default { Doctor_POST, Application_POST, List_POST }