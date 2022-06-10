import { StatusCodes } from 'http-status-codes';
import { ACTIVITY_LOG_TYPES } from '../../../../constant';
import Transaction from '../../../db/models/transaction.model';
import activityLog from '../../../services/activityLog';

export const createTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create({
            ...req.body,
            patientID: req.user._id,
        });

        const tempArray = {};
        tempArray['oldData'] = null;
        tempArray['newData'] = transaction;
        await activityLog.create(
            req.user?._id,
            req.user?.role_id,
            ACTIVITY_LOG_TYPES.CREATED,
            req,
            tempArray
        );

        return res.status(StatusCodes.OK).json({
            type: "success",
            status: true,
            message: 'Transaction created',
            data: { transaction },
        });
    } catch (error) {
        console.log({ error });
        return res.status(400).json({
            type: "error",
            status: false,
            message: error.message,
        });
    }
};
