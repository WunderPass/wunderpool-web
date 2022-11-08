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
    network_event_id,
    event_competition,
    event_competition_name,
    team_home,
    team_home_id,
    team_away,
    team_away_id,
  } = event;

  var shortName = event_name.match(/(.*) -.*vs\./)[1];

  return {
    id: event_id,
    shortName: shortName || event_name,
    name: event_name,
    type: event_type,
    startTime: new Date(`${utc_start_time}Z`) || null,
    endTime: new Date(`${utc_end_time}Z`) || null,
    iconUrl: event_icon_url || null,
    state: event_state,
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
  const { state, game_id, name, event, participants } = game;

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
    games,
    members,
    rule,
    public: isPublic,
  } = competition;

  return {
    id: competition_id,
    name,
    version,
    poolAddress: pool_address,
    isPublic,
    games: games.map(formatGame).filter((g) => g),
    members: members,
    payoutRule: rule.payout_type,
    stake: rule.stake,
    maxMembers: rule.max_members,
  };
}
