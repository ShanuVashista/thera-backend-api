import { StatusCodes } from 'http-status-codes';
import Notification from '../../db/models/notification.model';
import { filterPaginate } from '../../lib/filterPaginate';

export const listNotifications = async (req, res) => {
    try {
        const { f = {} } = req.query;
        const filter = {
            userId: req.user._id,
            ...f,
        };

        const {
            docs: notifications,
            total,
            totalPages,
            page,
            limit,
        } = await filterPaginate(Notification, filter, req.query);

        res.status(200).json({
            type: 'success',
            status:true,
            message: 'Notifications list',
            notifications,
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        // console.log({ error });
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            type: 'error',
            status:false,
            message: error.message,
        });
    }
};

export const clearNotification =async (req,res) => {
    const {Id} =req.query
    try{
        await Notification.deleteMany({userId:Id},function(err, _) {
            if(err){
                return  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    type: 'error',
                    status:false,
                    message: err.message,
                });
            }
            res.status(200).json({
                type: 'success',
                status: true,
                message: 'Notifications Cleared',
            });
        })
    }catch(err){
        // console.log(err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            type: 'error',
            status:false,
            message: err.message,
        });
    }
}
