import { Router } from "express";
import { deleteTransaction, getTransactions, postTransaction, putTransaction } from '../controllers/transaction.controller.js';

const transactionsRouter = Router();

transactionsRouter.post('/transactions/:type', postTransaction);
transactionsRouter.get('/transactions', getTransactions);
transactionsRouter.delete('/transactions/:id', deleteTransaction);
transactionsRouter.put('/transactions/:id', putTransaction);

export default transactionsRouter;
