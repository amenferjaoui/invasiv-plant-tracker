import { Response, Request } from "express";
import Database from "../database/connect";
import FormData from "form-data";
import axios from "axios";

type ApiErrorCode = 400 | 401 | 404 | 413 | 414 | 415 | 429 | 500;

interface PlantNetImage {
  url: {
    o: string;
    m: string;
    s: string;
  };
  organ: string;
  author: string;
  license: string;
  date: {
    timestamp: number;
    string: string;
  };
}

interface PlantNetSpecies {
  scientificNameWithoutAuthor: string;
  scientificNameAuthorship: string;
  genus: {
    scientificName: string;
  };
  family: {
    scientificName: string;
  };
  commonNames: string[];
  scientificName: string;
}

interface PlantNetResult {
  score: number;
  species: PlantNetSpecies;
  images: PlantNetImage[];
}

interface PlantNetResponse {
  results: PlantNetResult[];
  remainingIdentificationRequests: number;
  version: string;
  bestMatch?: string;
}

const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  400: "Format de la requête invalide. Veuillez réessayer.",
  401: "Erreur d'authentification avec le service d'identification.",
  404: "La plante n'a pas pu être identifiée. Essayez de prendre une photo plus nette ou sous un angle différent.",
  413: "L'image est trop volumineuse. Veuillez prendre une photo avec une résolution plus faible.",
  414: "L'URL de la requête est trop longue.",
  415: "Le format de l'image n'est pas supporté. Veuillez utiliser une image JPEG.",
  429: "Trop de requêtes envoyées. Veuillez attendre quelques minutes avant de réessayer.",
  500: "Le service d'identification est temporairement indisponible. Veuillez réessayer plus tard."
};

export const handelApiCall = async (req: Request & { file?: any }, res: Response): Promise<void> => {
  try {
    console.log("Received request:", {
      hasFile: !!req.file,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: "Aucune image n'a été reçue. Veuillez prendre une photo."
      });
      return;
    }

    // Parse and round coordinates to 3 decimal places (approximately 111 meters precision)
    const latitude = Math.round(parseFloat(req.body.latitude) * 1000) / 1000;
    const longitude = Math.round(parseFloat(req.body.longitude) * 1000) / 1000;

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        status: 'error',
        message: "Coordonnées GPS invalides"
      });
      return;
    }

    const imageBuffer = req.file.buffer;

    // Create form data exactly matching the curl format
    const formData = new FormData();
    formData.append('images', imageBuffer, {
      filename: 'plant.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('organs', 'auto');

    console.log("Sending request to PlantNet...");
    try {
      const response = await axios.post<PlantNetResponse>(
        'https://my-api.plantnet.org/v2/identify/all?include-related-images=true&no-reject=false&nb-results=10&lang=fr&api-key=2b10JXfQ0h8ROmaX99KyJY7vu',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'accept': 'application/json'
          }
        }
      );

      console.log("Received successful response from PlantNet");
      const result = response.data;
      console.log("API response data:", result);

      if (!result.results || result.results.length === 0) {
        res.status(200).json({
          status: 'unidentified',
          message: API_ERROR_MESSAGES[404]
        });
        return;
      }

      // Transform the results to include only necessary information
      const matches = result.results.map((match: PlantNetResult) => ({
        score: match.score,
        species: {
          scientificName: match.species.scientificNameWithoutAuthor,
          family: {
            scientificName: match.species.family.scientificName
          }
        },
        images: match.images.map((img: PlantNetImage) => ({
          url: {
            m: img.url.m
          }
        }))
      }));

      console.log("Sending matches response...");
      res.json({
        status: 'identified',
        results: matches,
        latitude: latitude,
        longitude: longitude
      });

    } catch (apiError: any) {
      // Handle PlantNet API specific errors
      const statusCode = apiError.response?.status as ApiErrorCode;
      if (statusCode && API_ERROR_MESSAGES[statusCode]) {
        res.status(200).json({
          status: 'error',
          message: API_ERROR_MESSAGES[statusCode]
        });
        return;
      }
      throw apiError;
    }

  } catch (error: any) {
    console.error("Error processing the image:", error);
    console.error("Error stack:", error.stack);
    
    const errorResponse = {
      status: 'error',
      message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      details: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : undefined
    };
    
    console.error("Sending error response:", errorResponse);
    res.status(500).json(errorResponse);
  }
};

export const validateMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scientificName, latitude, longitude, imageUrl } = req.body;

    if (!scientificName || !latitude || !longitude || !imageUrl) {
      res.status(400).json({
        status: 'error',
        message: "Missing required information"
      });
      return;
    }

    const dbInstance = Database.getInstance();

    // Check if plant is invasive
    console.log("Checking if plant is invasive...");
    const invasiveCheck = await dbInstance.query(
      "SELECT * FROM invasiv_plants WHERE reference_name LIKE $1",
      [`%${scientificName}%`]
    );

    const isInvasive = invasiveCheck.length > 0;

    // Get the family from invasiv_plants if it exists
    const familyQuery = await dbInstance.query(
      "SELECT family FROM invasiv_plants WHERE reference_name LIKE $1",
      [`%${scientificName}%`]
    );
    const family = familyQuery.length > 0 ? familyQuery[0].family : 'Famille inconnue';

    // Store the validated result
    console.log("Storing classification result...");
    const classificationResult = await dbInstance.query(
      "INSERT INTO classification_results (name, probability, is_invasive, latitude, longitude, img_url, family) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [scientificName, 1, isInvasive, latitude, longitude, imageUrl, family]
    );

    res.json({
      status: 'success',
      name: scientificName,
      isInvasiv: isInvasive,
      latitude: latitude,
      longitude: longitude,
      imgUrl: imageUrl
    });

  } catch (error) {
    console.error("Error validating match:", error);
    res.status(500).json({
      status: 'error',
      message: "Une erreur s'est produite lors de la validation"
    });
  }
};
