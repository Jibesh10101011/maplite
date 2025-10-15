import { Router } from "express";
import { 
    handleSignIn, 
    handleSignUp, 
    getCurrentUser 
} from "../controllers/auth.controller";
import { validateSchema } from "../utils/validateSchema";
import { verifyJWT } from "../middlewares/auth.middleware";
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

router.route("/user/me")
.get(
    verifyJWT,
    getCurrentUser
)


export default router;