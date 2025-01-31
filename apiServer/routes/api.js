const { Router } = require("express");
const { handleApi } = require("../controllers/api");
const router = Router();

router.route("/get-info").post(handleApi);

module.exports=router;