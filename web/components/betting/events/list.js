import { Stack, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import EventCard from '/components/betting/events/eventCard';

export default function EventList(props) {
  const { user, handleError } = props;
  const router = useRouter();

  return false ? ( //TODO
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : (
    <Stack style={{ maxWidth: '100%' }}>
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 grid grid-cols-1 gap-5 w-full">
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
      </div>
    </Stack>
  );
}
