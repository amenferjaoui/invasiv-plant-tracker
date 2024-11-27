export const mock =  {
    "access_token": "mock",
    "model_version": "plant_id:4.3.1",
    "custom_id": null,
    "input": {
        "latitude": 40.7128,
        "longitude": -74.006,
        "similar_images": true,
        "images": [
            "https://plant.id/media/imgs/b115ca03d5e84696aa2e510c687723cc.jpg"
        ],
        "datetime": "2024-11-26T13:20:08.946320+00:00"
    },
    "result": {
        "is_plant": {
            "probability": 0.9992737,
            "threshold": 0.5,
            "binary": true
        },
        "classification": {
            "suggestions": [
                {
                    "id": "29c7639a23c63596",
                    "name": "Robinia pseudoacacia",
                    "probability": 0.99,
                    "similar_images": [
                        {
                            "id": "42c7338c4dabad0095b41625c37666dd8e3aaa1f",
                            "url": "https://plant-id.ams3.cdn.digitaloceanspaces.com/similar_images/4/42c/7338c4dabad0095b41625c37666dd8e3aaa1f.jpeg",
                            "license_name": "CC BY-SA 4.0",
                            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
                            "citation": "Nathalie Potel",
                            "similarity": 0.701,
                            "url_small": "https://plant-id.ams3.cdn.digitaloceanspaces.com/similar_images/4/42c/7338c4dabad0095b41625c37666dd8e3aaa1f.small.jpeg"
                        },
                        {
                            "id": "aea4d8c16c65e1fc9ff7aa5058a49776770f9b22",
                            "url": "https://plant-id.ams3.cdn.digitaloceanspaces.com/similar_images/4/aea/4d8c16c65e1fc9ff7aa5058a49776770f9b22.jpeg",
                            "license_name": "CC BY-SA 4.0",
                            "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
                            "citation": "juan llanos",
                            "similarity": 0.699,
                            "url_small": "https://plant-id.ams3.cdn.digitaloceanspaces.com/similar_images/4/aea/4d8c16c65e1fc9ff7aa5058a49776770f9b22.small.jpeg"
                        }
                    ],
                    "details": {
                        "language": "en",
                        "entity_id": "29c7639a23c63596"
                    }
                }
            ]
        }
    },
    "status": "COMPLETED",
    "sla_compliant_client": true,
    "sla_compliant_system": true,
    "created": 1732627208.94632,
    "completed": 1732627209.234735
  }