import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useBettingService(
  userAddress,
  handleError = () => {},
  props
) {
  const [games, setGames] = useState(null);
  const [events, setEvents] = useState(null);
  const [bettingGames, setBettingGames] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const fetchBettingGames = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events',
        })
      ).data;
      const games = (
        await axios({
          url: '/api/betting/games',
          params: { address: userAddress },
        })
      ).data;
      setBettingGames(
        games.map((g) => ({
          ...g,
          event: events.find(
            (e) => e.blockchainId == g.id && e.version == g.version
          ),
        }))
      );
    } catch (error) {
      handleError('Could not load Betting Games');
    }
  };

  const fetchAllGames = async () => {
    try {
      const games = (
        await axios({
          url: '/api/betting/games',
          params: { address: userAddress },
        })
      ).data;
      setGames(games);
    } catch (error) {
      console.log(error);

      handleError('Could not load Events');
    }
  };

  const fetchAllEvents = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events',
        })
      ).data;

      setEvents(events);
    } catch (error) {
      console.log(error);
      handleError('Could not load Games');
    }
  };

  const initialize = async () => {
    await fetchBettingGames();
    await fetchAllGames();
    await fetchAllEvents();
  };

  useEffect(() => {
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [userAddress]);

  return { games, events, bettingGames, isReady };
}
