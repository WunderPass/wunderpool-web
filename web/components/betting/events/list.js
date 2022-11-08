import { Stack, Skeleton } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { compAddr } from '../../../services/memberHelpers';
import EventCard from '/components/betting/events/eventCard';

export default function EventList(props) {
  const { eventTypeSort, bettingService, sortId, isSortById } = props;
  const [publicGames, setPublicGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPublicGames = async () => {
    return await axios({
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
          const pool = pools.find((p) =>
            compAddr(p.pool_address, game.poolAddress)
          );
          return pool ? { ...game, pool } : null;
        })
        .filter((g) => g);
      setPublicGames(resolvedGames);
    });
  };

  useEffect(() => {
    setLoading(true);
    getPublicGames().then(() => {
      setLoading(false);
    });
  }, []);

  return !loading || bettingService.isReady ? (
    <Stack style={{ maxWidth: '100%' }}>
      <div
        className={
          ' grid grid-cols-1 gap-5 w-full'
          //: '2xl:grid-cols-2 2xl:gap-6 grid grid-cols-1 gap-5 w-full'
        }
      >
        {bettingService.events.map((event) => {
          if (isSortById) {
            if (event.id == sortId) {
              return (
                <EventCard
                  key={`event-card-${event.id}`}
                  event={event}
                  games={publicGames}
                  {...props}
                />
              );
            }
          } else if (
            event.competitionName == eventTypeSort ||
            eventTypeSort == 'All Events'
          ) {
            return (
              <EventCard
                key={`event-card-${event.id}`}
                event={event}
                games={publicGames}
                {...props}
              />
            );
          }
        })}
      </div>
    </Stack>
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}
