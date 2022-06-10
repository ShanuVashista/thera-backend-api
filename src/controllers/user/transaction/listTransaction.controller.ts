import { StatusCodes } from 'http-status-codes';
import Transaction from '../../../db/models/transaction.model';
import { filterPaginate } from '../../../lib/filterPaginate';

export const listTransaction = async (req, res) => {
    try {
        const { f } = req.query;

        const filter = {
            patientID: req.user._id,
            ...f,
        };

        const {
            docs: transactions,
            total,
            totalPages,
            page,
            limit,
        } = await filterPaginate(Transaction, filter, req.query);

        return res.status(StatusCodes.OK).json({
            status:true,
            type: 'success',
            message: 'Transaction list',
            data:transactions,
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        console.log({ error });
        return res.status(400).json({
            status: false,
            type: 'error',
            message: error.message,
        });
    }
};
