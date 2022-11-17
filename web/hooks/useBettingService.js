import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { compAddr } from '../services/memberHelpers';

export default function useBettingService(
  userAddress,
  handleError = () => {},
  props
) {
  const [competitions, setCompetitions] = useState([]);
  const [userCompetitions, setUserCompetitions] = useState([]);
  const [userHistoryCompetitions, setUserHistoryCompetitions] = useState([]);
  const [publicCompetitions, setPublicCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const getCompetitions = async () => {
    await axios({
      url: `/api/betting/competitions`,
    }).then(async (res) => {
      setCompetitions(res.data);
      setUserCompetitions(
        res.data.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
      setPublicCompetitions(res.data.filter((comp) => comp.isPublic));
    });
  };

  const getHistory = async () => {
    await axios({
      url: `/api/betting/competitions`,
    }).then(async (res) => {
      console.log('res.data', res.data);
      console.log(
        'filtered',
        res.data.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
      setUserHistoryCompetitions(
        res.data.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
    });
  };

  const getEvents = async () => {
    await axios({
      url: `/api/betting/events/registered`,
    }).then((res) => {
      setEvents(res.data.filter((e) => new Date(e.startTime) > new Date()));
    });
  };

  const initialize = async () => {
    await getCompetitions();
    await getEvents();
    await getHistory();
  };

  useEffect(() => {
    if (userAddress || router.asPath == '/betting/events') {
      setIsReady(false);
      initialize().then(() => {
        setIsReady(true);
      });
    }
  }, [userAddress, router.asPath]);

  return {
    competitions,
    publicCompetitions,
    userCompetitions,
    userHistoryCompetitions,
    events,
    isReady,
  };
}
