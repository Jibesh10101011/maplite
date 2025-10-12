const {Router} = require("express");
const router = Router();
const { handleGetKeys,handleDeleteKeys,handleGetMessage } = require("../controllers/test");

router.route("/keys").get(handleGetKeys);
router.route("/delete-keys").delete(handleDeleteKeys);
router.route("/keys/:roomId").get(handleGetMessage);

module.exports=router;