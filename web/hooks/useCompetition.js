import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { compAddr } from '../services/memberHelpers';

export default function useCompetition(competitionId, user) {
  const [competition, setCompetition] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const isParticipant = useMemo(() => {
    return Boolean(
      competition?.members.find((member) =>
        compAddr(member.address, user.address)
      )
    );
  }, [competition, user?.address]);

  const isGameParticipant = (gameId) => {
    return Boolean(
      competition?.games.find(
        (game) =>
          game.id == gameId &&
          game.participants.find((participant) =>
            compAddr(participant.address, user.address)
          )
      )
    );
  };

  const getCompetition = async () => {
    try {
      const { data: competition } = await axios({
        method: 'get',
        url: `/api/betting/competitions/show`,
        params: { id: competitionId },
      });
      setCompetition(competition);
    } catch (error) {
      console.log(error);
    }
  };

  const initialize = async () => {
    await getCompetition();
  };

  useEffect(() => {
    if (!competitionId) return;
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [competitionId]);

  return {
    competition,
    games: competition?.games,
    isParticipant,
    isGameParticipant,
    isReady,
  };
}
