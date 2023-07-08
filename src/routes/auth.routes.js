import { Router } from "express";
import { logOut, signIn, signUp } from '../controllers/auth.controller.js';
import { schemaValidation } from "../middlewares/schemaValidation.middleware.js";
import { signInSchema, signUpSchema } from "../schemas/schemas.js";

const authRouter = Router();

authRouter.post('/sign-up', schemaValidation(signUpSchema), signUp);
authRouter.post('/sign-in', schemaValidation(signInSchema), signIn);
authRouter.delete('/log-out', logOut);

export default authRouter;

