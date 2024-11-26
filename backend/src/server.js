const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' })); 

app.post('/process-image', (req, res) => {
  const { image } = req.body;

  if (!image || typeof image !== 'string') {
    return res.status(400).send('Invalid or missing Base64 image in the request.');
  }

  try {
    const buffer = Buffer.from(image, 'base64');

    const outputPath = path.join(__dirname, 'output-image.png');
    fs.writeFileSync(outputPath, buffer);

    res.send({ message: 'Image received and processed successfully.' });
  } catch (error) {
    console.error('Error processing the image:', error);
    res.status(500).send('Failed to process the image.');
  }
});

app.listen(port, () => {
  console.log(`Server is  at http://localhost:${port}`);
});