import { Router } from "express";
import authRouter from "./auth.routes.js";
import transactionsRouter from "./transaction.routes.js";

const indexRouter = Router();

//é necessario deixar o transactionsRouter depois do authRouter
//para que o middleware userUnauthorized não afete o mesmo
indexRouter.use(authRouter, transactionsRouter);

export default indexRouter;

