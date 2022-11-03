import { Stack, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EventCard from '/components/betting/events/eventCard';
import axios from 'axios';

export default function EventList(props) {
  const { user, bettingService, eventTypeSort, events, loading, handleError } =
    props;

  return loading ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : (
    <Stack style={{ maxWidth: '100%' }}>
      <div className="2xl:grid-cols-2 2xl:gap-6 grid grid-cols-1 gap-5 w-full">
        {bettingService.events.map((event) => {
          if (
            event.competitionName == eventTypeSort ||
            eventTypeSort == 'All Events'
          ) {
            return <EventCard user={user} event={event} />;
          }
        })}
      </div>
    </Stack>
  );
}
