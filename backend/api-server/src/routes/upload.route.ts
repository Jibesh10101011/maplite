import { Router } from "express";
import { handleUploadFile } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router: Router = Router();

router.route("/upload-file").post(
    verifyJWT,
    upload.single("file"), 
    handleUploadFile
);

export default router;
