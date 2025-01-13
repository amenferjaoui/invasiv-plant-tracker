import express from "express";
import multer from "multer";
import { handelApiCall, validateMatch } from "../controller/controller.procces-image";
import { handelGetInvasiv } from "../controller/controller.getInvasivInfo";
import Database from "../database/connect";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post("/process-image", upload.single('image'), handelApiCall);
router.get("/getInvasivPlants", handelGetInvasiv);
router.post("/validate-match", validateMatch); // New endpoint for validating matches

// New endpoint to serve stored images
router.get("/api/images/:id", async (req, res) => {
  try {
    const dbInstance = Database.getInstance();
    const result = await dbInstance.query(
      "SELECT image_data FROM captured_images WHERE classification_result_id = $1",
      [req.params.id]
    );

    if (result.length === 0) {
      res.status(404).send("Image not found");
      return;
    }

    const imageBuffer = result[0].image_data;
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).send("Failed to retrieve image");
  }
});

export default router;
