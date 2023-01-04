import { Stack, Skeleton } from '@mui/material';
import { useState } from 'react';
import EventCard from '/components/betting/events/eventCard';

export default function EventList(props) {
  const { eventTypeSort, bettingService, sortId, isSortById } = props;
  const [publicCompetitions, setPublicCompetitions] = useState([]);

  return bettingService.isReady ? (
    <div className="grid grid-cols-1 gap-5 w-full">
      {console.log(bettingService, 'bettingService')}
      {bettingService.events.map((event) => {
        if (
          (isSortById && event.id == sortId) ||
          [event.competitionName, 'All Events'].includes(eventTypeSort)
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
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}
