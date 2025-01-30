const { Router } = require("express");
const { handleGenerateRoomId, handleCreateRoom } = require("../controllers/room");
const router = Router();

router.route("/genId").get(handleGenerateRoomId);
router.route("/create").post(handleCreateRoom);

module.exports=router;