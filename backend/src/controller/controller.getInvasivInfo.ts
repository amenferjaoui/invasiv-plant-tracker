import { Request, Response } from "express";
import Database from "../database/connect";

export const handelGetInvasiv = async (req: Request, res: Response) => {
  const dbInstance = Database.getInstance();
  const data = await dbInstance.query(
    "select distinct name,probability,is_invasive,latitude,longitude,img_url from  classification_results"
  );
  res.json(data);
};
