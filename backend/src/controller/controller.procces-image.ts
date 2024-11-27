import { Response, Request } from "express";
import { mock } from "../mockData/apiResponse";
import Database from "../database/connect";

export const handelApiCall = async (req: Request, res: Response) => {
  try {


    const response = await fetch("https://plant.id/api/v3/identification", {
      method: "POST",
      headers: {
        "Api-Key": String(process.env.apiKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: [req.body.image],
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        similar_images: true,
      }),
    });

    const result = await response.json() ;
    


    const dbInstance = Database.getInstance();
    const data = await dbInstance.query(
      "select * from invasiv_plants where reference_name like $1",
      [`%${result.result.classification.suggestions[0].name}%`]
    );
    if (data.length > 0) {
      res.json({
        name: result.result.classification.suggestions[0].name,
        probability: result.result.classification.suggestions[0].probability,
        isInvasiv: true,
        latitude: result.input.latitude,
        longitude: result.input.longitude,
        imgUrl: result.input.images[0], 
      });
    } else {
      res.json({
        name: result.result.classification.suggestions[0].name,
        probability: result.result.classification.suggestions[0].probability,
        isInvasiv: false,
        latitude: result.input.latitude,
        longitude: result.input.longitude,
        imgUrl: result.input.images[0],
      });
    }

    dbInstance.query(
      "insert into classification_results  (name, probability, is_invasive, latitude, longitude, img_url) values ($1,$2,$3,$4,$5,$6)",
      [
        result.result.classification.suggestions[0].name,
        result.result.classification.suggestions[0].probability,
        data.length > 0 ? true : false,
        result.input.latitude,
        result.input.longitude,
        result.input.images[0],
      ]
    );

    return;
  } catch (error) {
    console.error("Error processing the image:", error);
    res.status(500).send("Failed to process the image.");
  }
};
