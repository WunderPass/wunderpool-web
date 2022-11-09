export function formatEvent(event) {
  if (!event) return null;
  const {
    event_id,
    event_name,
    event_type,
    utc_start_time,
    utc_end_time,
    event_icon_url,
    event_state,
    event_result,
    network_event_id,
    event_competition,
    event_competition_name,
    team_home,
    team_home_id,
    team_away,
    team_away_id,
  } = event;

  var shortName = event_name.match(/(.*) -.*vs\./)[1];
  const outcome = event_result
    ? event_result.split(' - ').map((n) => Number(n))
    : [0, 0];

  return {
    id: event_id,
    shortName: shortName || event_name,
    name: event_name,
    type: event_type,
    startTime: new Date(`${utc_start_time}Z`) || null,
    endTime: new Date(`${utc_end_time}Z`) || null,
    iconUrl: event_icon_url || null,
    state: event_state,
    outcome: outcome.length == 2 ? outcome : [0, 0],
    blockchainId: network_event_id?.event_id || null,
    version: network_event_id?.contract_version || null,
    competitionName: event_competition_name || event_competition?.name,
    competitionId: event_competition?.id,
    teamHome: { id: team_home_id, name: team_home },
    teamAway: { id: team_away_id, name: team_away },
  };
}

export function calculateOdds(participants) {
  const winnerPredictions = [0, 0, 0];
  if (!participants || participants.length == 0) return [0, 0, 0];
  participants.forEach((p) => {
    if (Number(p.prediction[0]) > Number(p.prediction[1])) {
      winnerPredictions[0]++;
    } else if (Number(p.prediction[0]) == Number(p.prediction[1])) {
      winnerPredictions[1]++;
    } else if (Number(p.prediction[0]) < Number(p.prediction[1])) {
      winnerPredictions[2]++;
    }
  });

  return winnerPredictions.map((p) => p / participants.length);
}

export function formatParticipant(participant) {
  if (!participant) return null;
  const { user_address, home_score, away_score } = participant;

  return {
    address: user_address,
    prediction: [home_score, away_score],
  };
}

export function formatGame(game) {
  if (!game) return null;
  const { state, game_id, name, event, participants = [] } = game;

  return {
    id: game_id,
    state,
    name,
    event: formatEvent(event),
    participants: participants.map(formatParticipant).filter((p) => p),
  };
}

export function formatCompetition(competition) {
  if (!competition) return null;

  const {
    competition_id,
    name,
    version,
    pool_address,
    games = [],
    members = [],
    rule,
    public: isPublic,
  } = competition;

  return {
    id: competition_id,
    name,
    version,
    poolAddress: pool_address,
    isPublic,
    games: games.map(formatGame)?.filter((g) => g),
    members: members,
    payoutRule: rule?.payout_type,
    stake: Number(rule?.stake),
    maxMembers: rule?.max_members,
  };
}

export function calculatePoints(eventType, prediction, result) {
  if (eventType == 'SOCCER') {
    const winner = result[0] > result[1] ? 0 : result[1] > result[0] ? 1 : 2;
    const predictedWinner =
      prediction[0] > prediction[1] ? 0 : prediction[1] > prediction[0] ? 1 : 2;
    if (prediction[0] == result[0] && prediction[1] == result[1]) return 3;
    if (prediction[0] - prediction[1] == result[0] - result[1]) return 2;
    if (winner == predictedWinner) return 1;
    return 0;
  }
}

export function calculatePayout(payoutRule, results, stake) {
  const totalPot = stake * results.length;

  // Winner Takes It All
  if (payoutRule == 'WINNER_TAKES_IT_ALL') {
    const maxPoints = Math.max(...results.map(({ points }) => points));
    const winnerCount = results.filter(
      ({ points }) => points == maxPoints
    ).length;
    return results.map((participant) => {
      return {
        ...participant,
        winnings: participant.points == maxPoints ? totalPot / winnerCount : 0,
      };
    });
    // Proportional
  } else if (payoutRule == 'PROPORTIONAL') {
    const totalPoints = results.reduce((a, b) => a + b.points, 0);
    const winningsPerPoint = totalPot / totalPoints;
    return results.map((participant) => {
      return {
        ...participant,
        winnings:
          totalPoints == 0 ? stake : participant.points * winningsPerPoint,
      };
    });
  }
}

export function calculateWinnings(game, stake, result, payoutRule) {
  const { participants, event } = game;

  const results = participants.map((participant) => {
    const points = calculatePoints(event.type, participant.prediction, result);
    return { ...participant, points };
  });
  return calculatePayout(payoutRule, results, stake);
}
