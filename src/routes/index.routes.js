import { Router } from "express";
import authRouter from "./auth.routes.js";
import transactionsRouter from "./transaction.routes.js";

const indexRouter = Router();

indexRouter.use(authRouter, transactionsRouter);

export default indexRouter;

