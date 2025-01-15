import { Request, Response } from "express";
import Database from "../database/connect";

export const handelGetInvasiv = async (req: Request, res: Response) => {
  try {
    const dbInstance = Database.getInstance();
    const data = await dbInstance.query(
      `SELECT DISTINCT ON (cr.id)
        cr.name,
        cr.probability,
        cr.is_invasive,
        cr.latitude,
        cr.longitude,
        cr.img_url,
        COALESCE(ip.family, 'Famille inconnue') as family
      FROM classification_results cr
      LEFT JOIN invasiv_plants ip ON 
        LOWER(cr.name) = LOWER(ip.reference_name)
        OR LOWER(cr.name) = LOWER(ip.common_name)
        OR (ip.common_name IS NOT NULL AND LOWER(ip.common_name) LIKE '%' || LOWER(cr.name) || '%')
        OR (ip.reference_name IS NOT NULL AND LOWER(ip.reference_name) LIKE '%' || LOWER(cr.name) || '%')
      WHERE cr.is_invasive = true
      ORDER BY cr.id, cr.probability DESC`
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
