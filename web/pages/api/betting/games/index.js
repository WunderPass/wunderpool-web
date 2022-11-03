const fs = require('fs');

export default async function handler(req, res) {
  try {
    if (fs.existsSync('./data/games.json')) {
      const allPools = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
      const filteredPools = req.query.address
        ? allPools.filter(
            (game) =>
              game.poolAddress.toLowerCase() == req.query.address.toLowerCase()
          )
        : allPools;
      res.status(200).json(filteredPools);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
