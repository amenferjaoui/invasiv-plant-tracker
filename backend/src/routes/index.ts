import { Router } from "express";
import { mock } from "../mockData/apiResponse";
import { handelApiCall } from "../controller/controller.procces-image";
import { handelGetInvasiv } from "../controller/controller.getInvasivInfo";

const router = Router();
router.post("/process-image", handelApiCall);
router.get("/getInvasivPlants", handelGetInvasiv);
export default router;
