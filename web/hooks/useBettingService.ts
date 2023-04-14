import { BettingEventsRegisteredResponse } from './../pages/api/betting/events/registered';
import { BettingCompetitionShowResponse } from './../pages/api/betting/competitions/show';
import {
  FormattedCompetition,
  FormattedEvent,
} from './../services/bettingHelpers';
import { BettingCompetitionsResponse } from './../pages/api/betting/competitions/index';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { compAddr } from '../services/memberHelpers';
import { SupportedChain } from '../services/contract/types';

export type UseBettingService = {
  competitions: FormattedCompetition[];
  publicCompetitions: FormattedCompetition[];
  userCompetitions: FormattedCompetition[];
  userHistoryCompetitions: FormattedCompetition[];
  reFetchCompetition: (id: number, timeout?: number) => void;
  events: FormattedEvent[];
  isReady: boolean;
};

export default function useBettingService(
  userAddress: string,
  chain: SupportedChain
): UseBettingService {
  const [competitions, setCompetitions] = useState<FormattedCompetition[]>([]);
  const [userCompetitions, setUserCompetitions] = useState<
    FormattedCompetition[]
  >([]);
  const [userHistoryCompetitions, setUserHistoryCompetitions] = useState<
    FormattedCompetition[]
  >([]);
  const [publicCompetitions, setPublicCompetitions] = useState<
    FormattedCompetition[]
  >([]);
  const [events, setEvents] = useState<FormattedEvent[]>([]);

  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const getCompetitions = async () => {
    if (!chain) return;
    try {
      const { data }: { data: BettingCompetitionsResponse } = await axios({
        url: `/api/betting/competitions`,
        params: { states: 'LIVE,UPCOMING', chain },
      });
      setCompetitions(data?.content);
      setUserCompetitions(
        data?.content.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
      setPublicCompetitions(data?.content.filter((comp) => comp.isPublic));
    } catch (error) {
      setCompetitions([]);
      setUserCompetitions([]);
      setPublicCompetitions([]);
    }
  };

  const reFetchCompetition = (id: number, timeout = 0) => {
    try {
      setTimeout(async () => {
        const { data }: { data: BettingCompetitionShowResponse } = await axios({
          url: `/api/betting/competitions/show`,
          params: { id },
        });
        setCompetitions((comps) =>
          comps.map((c) => (c.competitionId == data.competitionId ? data : c))
        );
        setUserCompetitions((comps) =>
          comps.map((c) => (c.competitionId == data.competitionId ? data : c))
        );
        setPublicCompetitions((comps) =>
          comps.map((c) => (c.competitionId == data.competitionId ? data : c))
        );
      }, timeout);
    } catch (error) {
      console.log(error);
    }
  };

  const getHistory = async () => {
    if (!chain) return;
    try {
      const { data }: { data: BettingCompetitionsResponse } = await axios({
        url: `/api/betting/competitions`,
        params: {
          userAddress: userAddress,
          states: 'HISTORIC',
          sort: 'endTimestamp,desc',
          size: 150,
          chain,
        },
      });

      setUserHistoryCompetitions(
        data?.content?.filter((comp) =>
          comp.members.find((m) => compAddr(m.address, userAddress))
        )
      );
    } catch (error) {
      setUserHistoryCompetitions([]);
    }
  };

  //TODO SORT THIS BY USER ?
  const getEvents = async () => {
    if (!chain) return;
    try {
      const { data }: { data: BettingEventsRegisteredResponse } = await axios({
        url: `/api/betting/events/registered`,
        params: { chain },
      });
      setEvents(data);
    } catch (error) {
      setEvents([]);
    }
  };

  const handleRouteChange = async () => {
    if (userAddress || router.asPath == '/betting/events') {
      setIsReady(competitions.length > 0 && events.length > 0);
      await getCompetitions();
      await getEvents();
      setIsReady(true);
    }
  };

  const handleChainChange = async () => {
    setIsReady(competitions.length > 0 && events.length > 0);
    await getCompetitions();
    await getEvents();
    setIsReady(true);
  };

  useEffect(() => {
    handleRouteChange();
  }, [userAddress, router.asPath]);

  useEffect(() => {
    handleChainChange();
  }, [chain]);

  useEffect(() => {
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
