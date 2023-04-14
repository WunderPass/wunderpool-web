import { Skeleton } from '@mui/material';
import { UseBettingService } from '../../../hooks/useBettingService';
import { UseNotification } from '../../../hooks/useNotification';
import { UseUserType } from '../../../hooks/useUser';
import MultiCard from './multiCard';

type MultiListProps = {
  bettingService: UseBettingService;
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function MulitList(props: MultiListProps) {
  const { bettingService } = props;

  return bettingService.isReady ? (
    <div className="grid grid-cols-1 gap-5 w-full">
      {bettingService.competitions.map((competition) => {
        return (
          <>
            <MultiCard
              key={`competition-card-${competition.competitionId}`}
              competition={competition}
              {...props}
            />
          </>
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
