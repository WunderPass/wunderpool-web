import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '/services/contract/pools';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import { fetchUserFriends } from '/services/memberHelpers';
import { ethProvider } from '/services/contract/provider';

export default function useBettingService(
  props,
  userAddress,
  handleError = () => {}
) {
  const [games, setGames] = useState(null);
  const [events, setEvents] = useState(null);
  const [bettingGames, setBettingGames] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const fetchBettingGames = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events/all',
        })
      ).data;
      const games = (
        await axios({
          url: '/api/betting/games/all',
          params: { address: userAddress },
        })
      ).data;

      setBettingGames(
        games.map((g) => ({
          ...g,
          event: events.find(
            (e) => e.id == g.eventId && e.version == g.version
          ),
        }))
      );
    } catch (error) {
      handleError('Could not load Games');
    }
  };

  const fetchAllGames = async () => {
    try {
      const games = (
        await axios({
          url: '/api/betting/games/all',
          params: { address: userAddress },
        })
      ).data;
      setGames(games);
    } catch (error) {
      handleError('Could not load Games');
    }
  };

  const fetchAllEvents = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events/all',
        })
      ).data;

      setEvents(events);
    } catch (error) {
      handleError('Could not load Games');
    }
  };

  const initialize = async () => {
    await fetchBettingGames();
    await fetchAllGames();
    await fetchAllEvents();
  };

  useEffect(() => {
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, []);

  return { games, events, bettingGames, isReady };
}
