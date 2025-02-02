const { Router } = require("express");
const { handleGenerateRoomId, handleCreateRoom, handleValidateRoom, getAllRooms } = require("../controllers/room");
const router = Router();

router.route("/genId").get(handleGenerateRoomId);
router.route("/create").post(handleCreateRoom);
router.route("/validate").post(handleValidateRoom);
router.route("/all").get(getAllRooms);

module.exports=router;