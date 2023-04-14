import { Skeleton } from '@mui/material';
import { useState } from 'react';
import { UseBettingService } from '../../../hooks/useBettingService';
import { UseNotification } from '../../../hooks/useNotification';
import { UseUserType } from '../../../hooks/useUser';
import EventCard from './eventCard';

type EventListProps = {
  eventTypeSort: string;
  bettingService: UseBettingService;
  sortId: number;
  isSortById: boolean;
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function EventList(props: EventListProps) {
  const { eventTypeSort, bettingService, sortId, isSortById } = props;

  return bettingService.isReady ? (
    <div className="grid grid-cols-1 gap-5 w-full">
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
