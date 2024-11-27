import { Router } from "express";
import { mock } from "../mockData/apiResponse";
import { handelApiCall } from "../controller/controller.procces-image";

const router = Router();
router.post("/process-image", handelApiCall);
export default router;
