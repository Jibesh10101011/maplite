const { Router } = require("express");
const { handleAuth } = require("../controllers/auth");
const router = Router();

router.route("/check-valid-user").post(handleAuth);

module.exports=router;