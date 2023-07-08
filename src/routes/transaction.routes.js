import { Router } from "express";
import { deleteTransaction, getTransactions, postTransaction, putTransaction } from '../controllers/transaction.controller.js';
import { schemaValidation } from "../middlewares/schemaValidation.middleware.js";
import { transactionSchema } from "../schemas/schemas.js";

const transactionsRouter = Router();

transactionsRouter.post('/transactions/:type', schemaValidation(transactionSchema), postTransaction);
transactionsRouter.get('/transactions', getTransactions);
transactionsRouter.delete('/transactions/:id', deleteTransaction);
transactionsRouter.put('/transactions/:id', putTransaction);

export default transactionsRouter;
