import { Stack, Skeleton } from '@mui/material';
import { useState } from 'react';
import EventCard from '/components/betting/events/eventCard';

export default function EventList(props) {
  const { eventTypeSort, bettingService, sortId, isSortById } = props;
  const [publicCompetitions, setPublicCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

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
