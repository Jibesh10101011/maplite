const { Router } = require("express");
const router = Router();
const { upload,handleFileUpload } = require("../controllers/upload");

router.route("/").post(upload.single("file"),handleFileUpload);

module.exports=router;

