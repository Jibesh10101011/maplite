import { Router } from "express";
import { handleSignIn, handleSignUp } from "../controllers/auth.controller";
import { validateSchema } from "../utils/validateSchema";
import { 
    createUserSchema,
    loginSchema
} from "../schemas/user.schema";


const router: Router = Router();

router.route("/sign-in")
.post(
    validateSchema(loginSchema),
    handleSignIn,
);

router.route("/sign-up")
.post(
    validateSchema(createUserSchema), 
    handleSignUp,
);


export default router;