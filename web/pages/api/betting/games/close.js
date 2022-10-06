const fs = require('fs');

export default async function handler(req, res) {
  try {
    let games = [];
    if (fs.existsSync('./data/games.json')) {
      games = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
    }

    const { gameId } = req.body;

    games.find((game) => game.id == gameId).closed = true;
    fs.writeFileSync('./data/games.json', JSON.stringify(games));
    res.status(200).json({ gameId, closed: true });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
