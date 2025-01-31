const { Router } = require("express");
const { testApi } = require("../controllers/test");
const router = Router();

router.route("/").post(testApi);

module.exports=router;