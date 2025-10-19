import { Router } from "express";
import { 
    getLocationCoordinates, 
    getShortestPathCoordinates 
} from "../controllers/location.controller";
import { CoordinateSchema } from "../schemas/location.schema";
import { validateSchema } from "../utils/validateSchema";

const router: Router = Router();

router.route("/coordinates/:roomId")
.get(getLocationCoordinates);

router.route("/shortest/path/src-dest")
.post(
    validateSchema(CoordinateSchema), 
    getShortestPathCoordinates
);

export default router;

