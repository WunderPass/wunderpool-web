import axios from 'axios';
import { formatEvent } from '../../../../services/eventHelpers';

const fs = require('fs');

export default async function handler(req, res) {
  try {
    let games = [];
    if (fs.existsSync('./data/games.json')) {
      games = JSON.parse(fs.readFileSync('./data/games.json', 'utf8'));
    }
    const timestamp = `${Number(new Date())}`;
    fs.writeFileSync(`./data/games_${timestamp}.json`, JSON.stringify(games));

    const { games: localGames = [] } = req.body;

    localGames.forEach((game) => {
      const serverGame = games.find((g) => g.id == game.id);
      if (serverGame) {
        game.participants.forEach((part) => {
          const serverParticipant = serverGame.participants.find(
            (p) => p.address == part.address
          );
          if (!serverParticipant) {
            console.log(`New Participant: ${part.address}`);
            serverGame.participants.push(part);
          }
        });
      } else {
        console.log(`New Game: ${game.name}`);
        games.push(game);
      }
    });

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_TOKEN}`,
    };
    const { data: liveEvents } = await axios({
      url: `${process.env.BETTING_SERVICE}/admin/liveEvents`,
      headers,
    });
    const { data: registeredEvents } = await axios({
      url: `${process.env.BETTING_SERVICE}/admin/settledEvents`,
      headers,
    });

    const events = [...liveEvents, ...registeredEvents].map(formatEvent);

    games.forEach((game) => {
      if (game.event.teamHome?.id) return;
      const ev = events.find((e) => e.id == game.event.id);
      if (ev) {
        game.event.teamHome = ev.teamHome;
        game.event.teamAway = ev.teamAway;
      }
    });

    fs.writeFileSync('./data/games.json', JSON.stringify(games));
    res.status(200).json(games);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
