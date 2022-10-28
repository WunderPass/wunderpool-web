import axios from 'axios';

const fs = require('fs');

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    let games = [];
    if (fs.existsSync('./data/games.json')) {
      games = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
    }

    const { gameId, version } = req.body;
    const game = games.find(
      (game) => game.id == gameId && game.version == version
    );
    game.closed = true;

    fs.writeFileSync('./data/games.json', JSON.stringify(games));

    await axios({
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${game.poolAddress.toLowerCase()}/members/shares/distribute`,
      headers: headers,
    });

    res.status(200).json({ gameId, closed: true });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
