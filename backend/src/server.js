const express = require('express');
const app = express();

const allowCors = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader ("Access-Control-Allow-Headers", "*")
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader("Access-Control-Allow-Methods","*") ;
  next();
}

app.use(allowCors ); 
const port = 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/process-image', (req, res) => {
  const { image } = req.body.image;
  const { latitude } = req.body.latitude;
  const { longitude } = req.body.longitude;

  if (!image || typeof image !== 'string') {
    return res.status(400).send('Invalid or missing Base64 image in the request.');
  }

  try {

    fetch("https://plant.id/api/v3/identification", {
      headers: {
        "Api-Key": process.env.apiKey,
        "Content-Type": "application/json"
      },
      body: {
        images: [image],
        latitude: latitude,
        longitude: longitude,
        similar_images: true
      }
    })

    res.send({ message: 'Image received and processed successfully.' });
  } catch (error) {
    console.error('Error processing the image:', error);
    res.status(500).send('Failed to process the image.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});