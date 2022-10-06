const fs = require('fs');

export default async function handler(req, res) {
  try {
    if (fs.existsSync('./data/games.json')) {
      const json = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
      const poolGames = json.filter((game) =>
        req.query.address
          ? game.poolAddress.toLowerCase() == req.query.address.toLowerCase()
          : true
      );
      res.status(200).json(poolGames);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
