import { Stack, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import EventCard from '/components/betting/events/eventCard';
import axios from 'axios';
import useBettingService from '../../../hooks/useBettingService';

export default function EventList(props) {
  const { eventTypeSort, bettingService } = props;
  const [events, setEvents] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEvents = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/events/registered`,
    }).then((res) => {
      setEvents(res.data.filter((e) => new Date(e.startTime) > new Date()));
    });
  };

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

  useEffect(() => {
    getEvents().then(() => {
      getGames().then(() => {
        setLoading(false);
      });
    });
  }, []);

  return loading ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : (
    <Stack style={{ maxWidth: '100%' }}>
      <div className="2xl:grid-cols-2 2xl:gap-6 grid grid-cols-1 gap-5 w-full">
        {events.map((event) => {
          if (
            event.competitionName == eventTypeSort ||
            eventTypeSort == 'All Events'
          ) {
            return (
              <EventCard
                key={`event-card-${event.id}`}
                event={event}
                games={games}
                {...props}
              />
            );
          }
        })}
      </div>
    </Stack>
  );
}
