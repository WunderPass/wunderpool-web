const fs = require('fs');

export default async function handler(req, res) {
  try {
    if (fs.existsSync('./data/publicPools.json')) {
      const json = JSON.parse(
        fs.readFileSync('./data/publicPools.json', 'utf8')
      );

      res.status(200).json(json);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
