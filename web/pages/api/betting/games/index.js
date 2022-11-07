import { compAddr } from '/services/memberHelpers';

const fs = require('fs');

export default async function handler(req, res) {
  try {
    const { poolAddress, userAddress, gameId } = req.query;

    if (fs.existsSync('./data/games.json')) {
      const allGames = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
      let filteredGames = allGames;

      if (poolAddress) {
        filteredGames = allGames.filter((game) =>
          compAddr(game.poolAddress, poolAddress)
        );
      } else if (userAddress) {
        filteredGames = allGames.filter((game) =>
          game.participants.find((part) => compAddr(part.address, userAddress))
        );
      } else if (gameId) {
        filteredGames = allGames.filter((game) => game.id == gameId);
      }
      const sortedGames = filteredGames.sort(
        (a, b) =>
          new Date(a.event?.startTime || 0) - new Date(b.event?.startTime || 0)
      );

      res.status(200).json(sortedGames);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
