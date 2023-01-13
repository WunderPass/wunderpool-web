import { Stack, Skeleton } from '@mui/material';
import { useState } from 'react';
import MultiCard from '/components/betting/multi/multiCard';

export default function MulitList(props) {
  const { eventTypeSort, bettingService, sortId, isSortById } = props;

  return bettingService.isReady ? (
    <div className="grid grid-cols-1 gap-5 w-full">
      {bettingService.competitions.map((competition) => {
        return (
          <MultiCard
            key={`competition-card-${competition.id}`}
            competition={competition}
            {...props}
          />
        );
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
