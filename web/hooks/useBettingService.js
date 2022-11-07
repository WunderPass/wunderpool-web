import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function useBettingService(
  userAddress,
  handleError = () => {},
  props
) {
  const [games, setGames] = useState([]);
  const [events, setEvents] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const getGames = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/games`,
      params: { userAddress: userAddress },
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
      console.log(resolvedGames);
      setGames(resolvedGames);
    });
  };

  const getEvents = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/events/registered`,
    }).then((res) => {
      setEvents(res.data.filter((e) => new Date(e.startTime) > new Date()));
    });
  };

  const initialize = async () => {
    await getGames();
    await getEvents();
  };

  useEffect(() => {
    if (userAddress || router.asPath == '/betting/events') {
      setIsReady(false);
      initialize().then(() => {
        setIsReady(true);
      });
    }
  }, [userAddress, router.asPath]);

  return { games, events, isReady };
}
