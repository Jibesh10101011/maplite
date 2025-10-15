import { Router } from "express";
import { getLocationCoordinates } from "../controllers/location.controller";

const router: Router = Router();

router.route("/coordinates/:roomId").get(getLocationCoordinates);

export default router;

