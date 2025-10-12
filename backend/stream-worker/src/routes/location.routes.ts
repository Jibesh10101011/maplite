import { Router } from "express";
import { handleCoordinates } from "../controllers/location.controller";
import { asyncHanlder } from "../utils/asyncHandler";

const router: Router = Router();

router.route("/send-location").post(asyncHanlder(handleCoordinates));

export default router;