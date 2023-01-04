import { Stack, Skeleton } from '@mui/material';
import { useState } from 'react';
import EventCard from '/components/betting/events/eventCard';

export default function EventList(props) {
  const { eventTypeSort, bettingService, sortId, isSortById, format } = props;

  return bettingService.isReady ? (
    <div className="grid grid-cols-1 gap-5 w-full">
      {bettingService.events.map((event) => {
        console.log('event', event);
        if (format == 'Single Competition') {
          if (
            (isSortById && event.id == sortId) ||
            [event.competitionName, 'All Events'].includes(eventTypeSort) // &&competition.length == 1
          ) {
            return (
              <EventCard
                key={`event-card-${event.id}`}
                event={event}
                {...props}
              />
            );
          }
        } else if (format == 'Multi Competition') {
          if (
            (isSortById && event.id == sortId) ||
            [event.competitionName, 'All Events'].includes(eventTypeSort) // &&competition.length > 1
          ) {
            return (
              <EventCard
                key={`event-card-${event.id}`}
                event={event}
                {...props}
              />
            );
          }
        } else {
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
