const fs = require('fs');

export default async function handler(req, res) {
  try {
    const { poolAddress, userAddress, gameId } = req.query;

    if (fs.existsSync('./data/games.json')) {
      const allGames = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
      let filteredGames = allGames;

      if (poolAddress) {
        filteredGames = allGames.filter(
          (game) => game.poolAddress.toLowerCase() == poolAddress.toLowerCase()
        );
      } else if (userAddress) {
        filteredGames = allGames.filter((game) =>
          game.participants.find(
            (part) => part.address.toLowerCase() == userAddress.toLowerCase()
          )
        );
      } else if (gameId) {
        filteredGames = allGames.filter((game) => game.id == gameId);
      }

      res.status(200).json(filteredGames);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
