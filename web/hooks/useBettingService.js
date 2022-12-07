import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { compAddr } from '../services/memberHelpers';

export default function useBettingService(userAddress) {
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
      params: { states: 'LIVE,UPCOMING' },
    }).then(({ data }) => {
      setCompetitions(data?.content);
      setUserCompetitions(
        data?.content.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
      setPublicCompetitions(data?.content.filter((comp) => comp.isPublic));
    });
  };

  const reFetchCompetition = (id, timeout = 0) => {
    try {
      setTimeout(async () => {
        const { data } = await axios({
          url: `/api/betting/competitions/show`,
          params: { id },
        });
        setCompetitions((comps) =>
          comps.map((c) => (c.id == data.id ? data : c))
        );
        setUserCompetitions((comps) =>
          comps.map((c) => (c.id == data.id ? data : c))
        );
        setPublicCompetitions((comps) =>
          comps.map((c) => (c.id == data.id ? data : c))
        );
      }, timeout);
    } catch (error) {
      console.log(error);
    }
  };

  const getHistory = async () => {
    try {
      const { data } = await axios({
        url: `/api/betting/competitions`,
        params: {
          userAddress: userAddress,
          states: 'HISTORIC',
          sort: 'endTimestamp,desc',
          size: 150,
        },
      });
      setUserHistoryCompetitions(
        data?.content?.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
    } catch (error) {
      console.log('Error fetching History', error);
    }
  };

  //TODO SORT THIS BY USER ?
  const getEvents = async () => {
    await axios({
      url: `/api/betting/events/registered`,
    }).then((res) => {
      setEvents(res.data);
    });
  };

  useEffect(async () => {
    if (userAddress || router.asPath == '/betting/events') {
      setIsReady(competitions.length > 0 && events.length > 0);
      await getCompetitions();
      await getEvents();
      setIsReady(true);
    }
  }, [userAddress, router.asPath]);

  useEffect(async () => {
    if (userAddress && router.asPath == '/betting/bets') {
      getHistory();
    }
  }, [userAddress, router.asPath]);

  return {
    competitions,
    publicCompetitions,
    userCompetitions,
    userHistoryCompetitions,
    reFetchCompetition,
    events,
    isReady,
  };
}
