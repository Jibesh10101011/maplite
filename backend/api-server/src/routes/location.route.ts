import { Router } from "express";
import { 
    getLocationCoordinates, 
    getShortestPathCoordinates,
    shortestPathCache,
    testLocation
} from "../controllers/location.controller";
import { CoordinateSchema, UserRoomSchema } from "../schemas/location.schema";
import { validateSchema } from "../utils/validateSchema";

const router: Router = Router();

router.route("/test").get(testLocation);

router.route("/coordinates/:roomId")
.get(getLocationCoordinates);

router.route("/shortest/path/src-dest")  // Implment Rate Limiter
.post(
    validateSchema(CoordinateSchema), 
    getShortestPathCoordinates
);

router.route("/shortest/path/src-dest/cache")
.post(
    validateSchema(UserRoomSchema),
    shortestPathCache
);

export default router;

