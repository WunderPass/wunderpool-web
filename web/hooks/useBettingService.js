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
  userAddress,
  handleError = () => {},
  props
) {
  const [games, setGames] = useState(null);
  const [events, setEvents] = useState(null);
  const [bettingGames, setBettingGames] = useState(null);
  const [isReady, setIsReady] = useState(false);

  console.log(userAddress);

  const fetchBettingGames = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events',
        })
      ).data;
      const games = (
        await axios({
          url: '/api/betting/games',
          params: { address: userAddress },
        })
      ).data;

      console.log('events', events);
      console.log('games', games);

      setBettingGames(
        games.map((g) => ({
          ...g,
          event: events.find(
            (e) => e.blockchainId == g.id && e.version == g.version
          ),
        }))
      );
    } catch (error) {
      handleError('Could not load Betting Games');
    }
  };

  const fetchAllGames = async () => {
    try {
      const games = (
        await axios({
          url: '/api/betting/games',
          params: { address: userAddress },
        })
      ).data;
      setGames(games);
    } catch (error) {
      console.log(error);

      handleError('Could not load Events');
    }
  };

  const fetchAllEvents = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events',
        })
      ).data;

      setEvents(events);
    } catch (error) {
      console.log(error);
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
  }, [userAddress]);

  return { games, events, bettingGames, isReady };
}
