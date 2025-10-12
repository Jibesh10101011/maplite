import { Router } from "express";
import { asyncHanlder } from "../utils/asyncHandler";
import { handleUploadFile } from "../controllers/upload.controller";

const router: Router = Router();

router.route("/upload-file").post(asyncHanlder(handleUploadFile));

export default router;
