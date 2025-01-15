import { Request, Response } from "express";
import Database from "../database/connect";

export const handelGetInvasiv = async (req: Request, res: Response) => {
  try {
    const dbInstance = Database.getInstance();
    const data = await dbInstance.query(
      `SELECT 
        cr.name,
        cr.probability,
        cr.is_invasive,
        cr.latitude,
        cr.longitude,
        cr.img_url,
        cr.family
      FROM classification_results cr
      WHERE cr.is_invasive = true
      ORDER BY cr.probability DESC`
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching invasive plants:", error);
    res.status(500).json({ 
      error: "Failed to fetch invasive plants",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
