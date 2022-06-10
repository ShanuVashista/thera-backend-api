import express from 'express';
import { listNotifications,clearNotification } from '../controllers/user/notification.controller';
import { validateQuery } from '../middlewares/joi.middleware';
import { paginationQuerySchema } from '../validator/util';

const notificationRouter = express.Router();

notificationRouter.get(
    '/',
    validateQuery(paginationQuerySchema),
    listNotifications
);

notificationRouter.delete(
    '/clear',
    // validateQuery(paginationQuerySchema),
    clearNotification
);

export default notificationRouter;
