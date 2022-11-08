import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { compAddr } from '../services/memberHelpers';

export default function useGame(gameId, user, props) {
  const [game, setGame] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [exists, setExists] = useState(false);

  const isParticipant = useMemo(() => {
    return Boolean(
      game?.participants.find((participant) =>
        compAddr(participant.address, user.address)
      )
    );
  }, [game, user?.address]);

  const getGames = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/games`,
      params: { gameId: gameId },
    }).then(async (res) => {
      if (res.data.length > 0) {
        setGame(res.data[0]);
        setExists(true);
      } else {
        setExists(false);
      }
    });
  };

  const initialize = async () => {
    await getGames();
  };

  useEffect(() => {
    if (!gameId) return;
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [gameId]);

  return { game, isParticipant, isReady, exists };
}
