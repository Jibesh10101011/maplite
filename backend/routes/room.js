const { Router } = require("express");
const { handleGenerateRoomId, handleCreateRoom, handleValidateRoom } = require("../controllers/room");
const router = Router();

router.route("/genId").get(handleGenerateRoomId);
router.route("/create").post(handleCreateRoom);
router.route("/validate").post(handleValidateRoom);

module.exports=router;