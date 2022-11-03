const fs = require('fs');

export default async function handler(req, res) {
  try {
    if (fs.existsSync('./data/games.json')) {
      const json = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
      //var games = json.filter((game) => game.participants.map();

      res.status(200).json(json);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
