import express from 'express';
import {
    createTransaction,
    getTransaction,
    listTransaction,
} from '../controllers/user/transaction';
import { validateBody, validateParams, validateQuery } from '../middlewares/joi.middleware';
import { createTransactionSchema } from '../validator/transaction';
import { paginationQuerySchema, pathParamIdSchema } from '../validator/util';

const transactionRouter = express.Router();

transactionRouter.post(
    '/',
    validateBody(createTransactionSchema),
    createTransaction
);

transactionRouter.get(
    '/',
    validateQuery(paginationQuerySchema),
    listTransaction
);

transactionRouter.get(
    '/:id',
    validateParams(pathParamIdSchema),
    getTransaction
);

export default transactionRouter;
