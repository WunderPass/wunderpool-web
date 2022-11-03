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
    event_competition_name,
    team_home,
    team_away,
  } = event;

  return {
    id: event_id,
    name: event_name,
    type: event_type,
    startTime: new Date(`${utc_start_time}Z`) || null,
    endTime: new Date(`${utc_end_time}Z`) || null,
    iconUrl: event_icon_url || null,
    state: event_state,
    blockchainId: network_event_id?.event_id || null,
    version: network_event_id?.contract_version || null,
    competitionName: event_competition_name,
    teamHome: team_home,
    teamAway: team_away,
  };
}
