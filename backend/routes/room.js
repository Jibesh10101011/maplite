const { Router } = require("express");
const { 
    handleGenerateRoomId, 
    handleCreateRoom, 
    handleValidateRoom, 
    getAllRooms, 
    handleRoomDeletion 
} = require("../controllers/room");
const router = Router();

router.route("/genId").get(handleGenerateRoomId);
router.route("/create").post(handleCreateRoom);
router.route("/validate").post(handleValidateRoom);
router.route("/all").get(getAllRooms);
router.route("/delete/:roomId").delete(handleRoomDeletion);

module.exports=router;