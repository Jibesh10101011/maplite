import { Router } from "express";
import { 
    handleGenerateRoomId, 
    handleCreateRoom, 
    handleValidateRoom, 
    getAllRooms, 
    handleRoomDeletion 
} from "../controllers/room.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { validateSchema } from "../utils/validateSchema";
import { 
    createRoomSchema,
    validateRoomSchema
} from "../schemas/room.schema";

const router: Router = Router();

router.route("/genId").get(handleGenerateRoomId);

router.route("/create")
.post(
    verifyJWT, 
    validateSchema(createRoomSchema), 
    handleCreateRoom
);

router.route("/validate").post(
    verifyJWT,
    validateSchema(validateRoomSchema),
    handleValidateRoom
);

router.route("/all").get(
    verifyJWT,
    getAllRooms
);

router.route("/delete/:roomId").delete(
    verifyJWT,
    handleRoomDeletion
);

export default router;