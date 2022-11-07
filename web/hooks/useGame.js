import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useGame(gameId, user, props) {
  const [game, setGame] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [exists, setExists] = useState(false);

  const getGames = async () => {
    await axios({
      method: 'get',
      url: `/api/betting/games`,
      params: { gameId: gameId },
    }).then(async (res) => {
      if (res.data.length > 0) {
        setGame(res.data[0]);
        checkIfParticipant(res.data[0]);
        setExists(true);
      } else {
        setExists(false);
      }
    });
  };

  const checkIfParticipant = (game) => {
    setIsParticipant(
      Boolean(
        game.participants.find(
          (participant) =>
            participant.address?.toLowerCase() === user.address?.toLowerCase()
        )
      )
    );
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
