const fs = require('fs');

export default async function handler(req, res) {
  try {
    let games = [];
    if (fs.existsSync('./data/games.json')) {
      games = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
    }

    const { gameId, address, prediction, wunderId, version } = req.body;

    games
      .find((g) => g.id == gameId && g.version == version)
      .participants.push({ address, prediction, wunderId });
    fs.writeFileSync('./data/games.json', JSON.stringify(games));
    res.status(200).json({ gameId, address, prediction, wunderId });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
