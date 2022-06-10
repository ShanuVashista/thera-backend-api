/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
import Prescription from '../../db/models/prescription.model';
import StatusCodes from "http-status-codes";
// import User from '../../db/models/user';
const Prescription_List_POST = async (req, res) => {
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
        const prescription = await Prescription.find(cond).populate('patient_details').populate('doctor_details').populate('appointment_details').sort(sort).skip((page - 1) * limit).limit(limit)
        const prescription_count = await Prescription.find(cond).count()
        const totalPages = Math.ceil(prescription_count / limit);
        res.status(StatusCodes.OK).send({
            status:true,
            type: 'success',
            message: "Prescription List Fetch Successfully",
            page: page,
            limit: limit,
            totalPages: totalPages,
            total: prescription_count,
            data: prescription,
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            status:false,
            type: 'error',
            message: error.message
        });
    }
}
export default Prescription_List_POST