import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useBettingService(
  userAddress,
  handleError = () => {},
  props
) {
  const [games, setGames] = useState(null);
  const [events, setEvents] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // const fetchBettingGames = async () => {
  // try {
  // const events = (
  //   await axios({
  //     url: '/api/betting/events',
  //   })
  // ).data;
  // const games = (
  //   await axios({
  //     url: '/api/betting/games',
  //     params: { userAddress: userAddress },
  //   })
  // ).data;
  //     setBettingGames(
  //       games.map((g) => ({
  //         ...g,
  //         event: events.find(
  //           (e) => e.blockchainId == g.id && e.version == g.version
  //         ),
  //       }))
  //     );
  //   } catch (error) {
  //     handleError('Could not load Betting Games');
  //   }
  // };

  // const fetchAllGames = async () => {
  //   try {
  //     const games = (
  //       await axios({
  //         url: '/api/betting/games',
  //         params: { userAddress: userAddress },
  //       })
  //     ).data;
  //     setGames(games);
  //   } catch (error) {
  //     console.log(error);

  //     handleError('Could not load Events');
  //   }
  // };

  const getGames = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/games`,
    }).then(async (res) => {
      const { data: pools } = await axios({
        method: 'get',
        url: `/api/pools/all`,
        params: { public: true },
      });
      const resolvedGames = res.data
        .map((game) => {
          const pool = pools.find(
            (p) =>
              p.pool_address.toLowerCase() == game.poolAddress.toLowerCase()
          );
          return pool ? { ...game, pool } : null;
        })
        .filter((g) => g);
      setGames(resolvedGames);
    });
  };

  // const fetchAllEvents = async () => {
  //   try {
  //     const events = (
  //       await axios({
  //         url: '/api/betting/events',
  //       })
  //     ).data;

  //     setEvents(events);
  //   } catch (error) {
  //     console.log(error);
  //     handleError('Could not load Games');
  //   }
  // };

  const getEvents = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/events/registered`,
    }).then((res) => {
      setEvents(res.data.filter((e) => new Date(e.startTime) > new Date()));
    });
  };

  // const initialize = async () => {
  //   await getGames();
  //   await getEvents();
  //   await fetchBettingGames();
  // };

  // useEffect(() => {
  //   setIsReady(false);
  //   initialize().then(() => {
  //     setIsReady(true);
  //   });
  // }, [userAddress]);

  useEffect(() => {
    getEvents().then(() => {
      getGames().then(() => {
        setIsReady(true);
      });
    });
  }, []);

  return { games, events, isReady };
}
