const fs = require('fs');

export default async function handler(req, res) {
  try {
    let games = [];
    if (fs.existsSync('./data/games.json')) {
      games = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
    }

    const {
      version,
      id,
      name,
      stake,
      tokenAddress,
      closed = false,
      event,
      payoutRule,
      participants = [],
      poolAddress,
    } = req.body;

    const game = {
      version,
      id,
      name,
      stake,
      tokenAddress,
      closed,
      event,
      payoutRule,
      participants,
      poolAddress,
    };
    games.push(game);
    fs.writeFileSync('./data/games.json', JSON.stringify(games));
    res.status(200).json(game);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
