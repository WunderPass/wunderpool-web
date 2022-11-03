import { Stack, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EventCard from '/components/betting/events/eventCard';
import axios from 'axios';

export default function EventList(props) {
  const { user, handleError } = props;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getEvents = async () => {
    axios({
      method: 'get',
      url: `/api/betting/events/listed`,
    }).then((res) => {
      console.log(res.data);
      setEvents(res.data);
    });
  };

  useEffect(() => {
    getEvents().then(() => setLoading(false));
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
          return <EventCard user={user} event={event} />;
        })}
      </div>
    </Stack>
  );
}
