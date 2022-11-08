const fs = require('fs');

export default async function handler(req, res) {
  const { id } = req.query;
  const imgPath = `./assets/teamImages/${id}.png`;

  if (fs.existsSync(imgPath)) {
    const imageBuffer = fs.readFileSync(imgPath);
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  } else {
    const imageBuffer = fs.readFileSync(`./assets/teamImages/fallback.png`);
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  }
}
