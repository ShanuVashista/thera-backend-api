/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, minlength: 2, maxlength: 50 },
        message: { type: String, required: true, minlength: 2, maxlength: 500 },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: { type: String, required: true, minlength: 2, maxlength: 50 },
        read: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('notification', notificationSchema);
export default Notification;
