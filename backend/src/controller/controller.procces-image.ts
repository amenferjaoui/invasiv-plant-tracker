import { Response, Request } from "express";
import { mock } from "../mockData/apiResponse";
import Database from "../database/connect";

export const handelApiCall = async (req: Request, res: Response) => {
  try {
    const dbInstance = Database.getInstance();
    const data = await dbInstance.query(
      "select * from invasiv_plants where reference_name like $1",
      [`%${mock.result.classification.suggestions[0].name}%`]
    );
    if (data.length > 0) {
      res.json({
        name: mock.result.classification.suggestions[0].name,
        probabilty: mock.result.classification.suggestions[0].probability,
        isIvasiv: true,
        latitude: mock.input.latitude,
        longitude: mock.input.longitude,
        imgUrl: mock.input.images[0],
      });
    } else {
      res.json({
        name: mock.result.classification.suggestions[0].name,
        probabilty: mock.result.classification.suggestions[0].probability,
        isIvasiv: false,
        latitude: mock.input.latitude,
        longitude: mock.input.longitude,
        imgUrl: mock.input.images[0],
      });
    }

    dbInstance.query(
      "insert into classification_results  (name, probability, is_invasive, latitude, longitude, img_url) values ($1,$2,$3,$4,$5,$6)",
      [
        mock.result.classification.suggestions[0].name,
        mock.result.classification.suggestions[0].probability,
        data.length > 0 ? true : false,
        mock.input.latitude,
        mock.input.longitude,
        mock.input.images[0],
      ]
    );

    return;

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

    res.send(await response.json());
  } catch (error) {
    console.error("Error processing the image:", error);
    res.status(500).send("Failed to process the image.");
  }
};
