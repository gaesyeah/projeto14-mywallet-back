import { Router } from "express";
import { logOut, signIn, signUp } from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.delete('/log-out', logOut);

export default authRouter;

