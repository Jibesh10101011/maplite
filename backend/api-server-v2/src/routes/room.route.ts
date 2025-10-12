import { Router } from "express";
import { asyncHanlder } from "../utils/asyncHandler";
import { 
    handleGenerateRoomId, 
    handleCreateRoom, 
    handleValidateRoom, 
    getAllRooms, 
    handleRoomDeletion 
} from "../controllers/room.controller";

const router: Router = Router();

router.route("/genId").get(asyncHanlder(handleGenerateRoomId));
router.route("/create").post(asyncHanlder(handleCreateRoom));
router.route("/validate").post(asyncHanlder(handleValidateRoom));
router.route("/all").get(asyncHanlder(getAllRooms));
router.route("/delete/:roomId").delete(asyncHanlder(handleRoomDeletion));

export default router;