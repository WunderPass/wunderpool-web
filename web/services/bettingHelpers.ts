import { SupportedChain, SupportedDistributorVersion } from './contract/types';
import { compAddr } from './memberHelpers';

type PayoutRule =
  | 'WINNER_TAKES_IT_ALL'
  | 'PROPORTIONAL'
  | 'FIFTY_THIRTY_TWENTY';

type EventType = 'SOCCER';

const abbreviationLookup = {
  afghanistan: 'AFG',
  albania: 'ALB',
  algeria: 'DZA',
  'american samoa': 'ASM',
  andorra: 'AND',
  angola: 'AGO',
  anguilla: 'AIA',
  antarctica: 'ATA',
  'antigua and barbuda': 'ATG',
  argentina: 'ARG',
  armenia: 'ARM',
  aruba: 'ABW',
  australia: 'AUS',
  austria: 'AUT',
  azerbaijan: 'AZE',
  'bahamas (the)': 'BHS',
  bahrain: 'BHR',
  bangladesh: 'BGD',
  barbados: 'BRB',
  belarus: 'BLR',
  belgium: 'BEL',
  belize: 'BLZ',
  benin: 'BEN',
  bermuda: 'BMU',
  bhutan: 'BTN',
  'bolivia (plurinational state of)': 'BOL',
  'bonaire, sint eustatius and saba': 'BES',
  'bosnia and herzegovina': 'BIH',
  botswana: 'BWA',
  'bouvet island': 'BVT',
  brazil: 'BRA',
  'british indian ocean territory (the)': 'IOT',
  'brunei darussalam': 'BRN',
  bulgaria: 'BGR',
  'burkina faso': 'BFA',
  burundi: 'BDI',
  'cabo verde': 'CPV',
  cambodia: 'KHM',
  cameroon: 'CMR',
  canada: 'CAN',
  'cayman islands (the)': 'CYM',
  'central african republic (the)': 'CAF',
  chad: 'TCD',
  chile: 'CHL',
  china: 'CHN',
  'christmas island': 'CXR',
  'cocos (keeling) islands (the)': 'CCK',
  colombia: 'COL',
  'comoros (the)': 'COM',
  'congo (the democratic republic of the)': 'COD',
  'congo (the)': 'COG',
  'cook islands (the)': 'COK',
  'costa rica': 'CRI',
  croatia: 'HRV',
  cuba: 'CUB',
  curaçao: 'CUW',
  cyprus: 'CYP',
  czechia: 'CZE',
  "côte d'ivoire": 'CIV',
  denmark: 'DNK',
  djibouti: 'DJI',
  dominica: 'DMA',
  'dominican republic (the)': 'DOM',
  ecuador: 'ECU',
  egypt: 'EGY',
  'el salvador': 'SLV',
  'equatorial guinea': 'GNQ',
  eritrea: 'ERI',
  estonia: 'EST',
  eswatini: 'SWZ',
  ethiopia: 'ETH',
  'falkland islands (the) [malvinas]': 'FLK',
  'faroe islands (the)': 'FRO',
  fiji: 'FJI',
  finland: 'FIN',
  france: 'FRA',
  'french guiana': 'GUF',
  'french polynesia': 'PYF',
  'french southern territories (the)': 'ATF',
  gabon: 'GAB',
  'gambia (the)': 'GMB',
  georgia: 'GEO',
  germany: 'DEU',
  ghana: 'GHA',
  gibraltar: 'GIB',
  greece: 'GRC',
  greenland: 'GRL',
  grenada: 'GRD',
  guadeloupe: 'GLP',
  guam: 'GUM',
  guatemala: 'GTM',
  guernsey: 'GGY',
  guinea: 'GIN',
  'guinea-bissau': 'GNB',
  guyana: 'GUY',
  haiti: 'HTI',
  'heard island and mcdonald islands': 'HMD',
  'holy see (the)': 'VAT',
  honduras: 'HND',
  'hong kong': 'HKG',
  hungary: 'HUN',
  iceland: 'ISL',
  india: 'IND',
  indonesia: 'IDN',
  'iran (islamic republic of)': 'IRN',
  iraq: 'IRQ',
  ireland: 'IRL',
  'isle of man': 'IMN',
  israel: 'ISR',
  italy: 'ITA',
  jamaica: 'JAM',
  japan: 'JPN',
  jersey: 'JEY',
  jordan: 'JOR',
  kazakhstan: 'KAZ',
  kenya: 'KEN',
  kiribati: 'KIR',
  "korea (the democratic people's republic of)": 'PRK',
  'korea (the republic of)': 'KOR',
  kuwait: 'KWT',
  kyrgyzstan: 'KGZ',
  "lao people's democratic republic (the)": 'LAO',
  latvia: 'LVA',
  lebanon: 'LBN',
  lesotho: 'LSO',
  liberia: 'LBR',
  libya: 'LBY',
  liechtenstein: 'LIE',
  lithuania: 'LTU',
  luxembourg: 'LUX',
  macao: 'MAC',
  madagascar: 'MDG',
  malawi: 'MWI',
  malaysia: 'MYS',
  maldives: 'MDV',
  mali: 'MLI',
  malta: 'MLT',
  'marshall islands (the)': 'MHL',
  martinique: 'MTQ',
  mauritania: 'MRT',
  mauritius: 'MUS',
  mayotte: 'MYT',
  mexico: 'MEX',
  'micronesia (federated states of)': 'FSM',
  'moldova (the republic of)': 'MDA',
  monaco: 'MCO',
  mongolia: 'MNG',
  montenegro: 'MNE',
  montserrat: 'MSR',
  morocco: 'MAR',
  mozambique: 'MOZ',
  myanmar: 'MMR',
  namibia: 'NAM',
  nauru: 'NRU',
  nepal: 'NPL',
  'netherlands (the)': 'NLD',
  'new caledonia': 'NCL',
  'new zealand': 'NZL',
  nicaragua: 'NIC',
  'niger (the)': 'NER',
  nigeria: 'NGA',
  niue: 'NIU',
  'norfolk island': 'NFK',
  'northern mariana islands (the)': 'MNP',
  norway: 'NOR',
  oman: 'OMN',
  pakistan: 'PAK',
  palau: 'PLW',
  'palestine, state of': 'PSE',
  panama: 'PAN',
  'papua new guinea': 'PNG',
  paraguay: 'PRY',
  peru: 'PER',
  'philippines (the)': 'PHL',
  pitcairn: 'PCN',
  poland: 'POL',
  portugal: 'PRT',
  'puerto rico': 'PRI',
  qatar: 'QAT',
  'republic of north macedonia': 'MKD',
  romania: 'ROU',
  'russian federation (the)': 'RUS',
  rwanda: 'RWA',
  réunion: 'REU',
  'saint barthélemy': 'BLM',
  'saint helena, ascension and tristan da cunha': 'SHN',
  'saint kitts and nevis': 'KNA',
  'saint lucia': 'LCA',
  'saint martin (french part)': 'MAF',
  'saint pierre and miquelon': 'SPM',
  'saint vincent and the grenadines': 'VCT',
  samoa: 'WSM',
  'san marino': 'SMR',
  'sao tome and principe': 'STP',
  'saudi arabia': 'SAU',
  senegal: 'SEN',
  serbia: 'SRB',
  seychelles: 'SYC',
  'sierra leone': 'SLE',
  singapore: 'SGP',
  'sint maarten (dutch part)': 'SXM',
  slovakia: 'SVK',
  slovenia: 'SVN',
  'solomon islands': 'SLB',
  somalia: 'SOM',
  'south africa': 'ZAF',
  'south georgia and the south sandwich islands': 'SGS',
  'south sudan': 'SSD',
  spain: 'ESP',
  'sri lanka': 'LKA',
  'sudan (the)': 'SDN',
  suriname: 'SUR',
  'svalbard and jan mayen': 'SJM',
  sweden: 'SWE',
  switzerland: 'CHE',
  'syrian arab republic': 'SYR',
  'taiwan (province of china)': 'TWN',
  tajikistan: 'TJK',
  'tanzania, united republic of': 'TZA',
  thailand: 'THA',
  'timor-leste': 'TLS',
  togo: 'TGO',
  tokelau: 'TKL',
  tonga: 'TON',
  'trinidad and tobago': 'TTO',
  tunisia: 'TUN',
  turkey: 'TUR',
  turkmenistan: 'TKM',
  'turks and caicos islands (the)': 'TCA',
  tuvalu: 'TUV',
  uganda: 'UGA',
  ukraine: 'UKR',
  'united arab emirates (the)': 'ARE',
  'united kingdom of great britain and northern ireland (the)': 'GBR',
  'united states minor outlying islands (the)': 'UMI',
  'united states of america (the)': 'USA',
  uruguay: 'URY',
  uzbekistan: 'UZB',
  vanuatu: 'VUT',
  'venezuela (bolivarian republic of)': 'VEN',
  'viet nam': 'VNM',
  'virgin islands (british)': 'VGB',
  'virgin islands (u.s.)': 'VIR',
  'wallis and futuna': 'WLF',
  'western sahara': 'ESH',
  yemen: 'YEM',
  zambia: 'ZMB',
  zimbabwe: 'ZWE',
  'åland islands': 'ALA',
};

function formatMinute(minute) {
  if (minute == 'FT') {
    return '';
  } else if (minute == 'HT') {
    return 'Halftime';
  } else if (/\+/.test(minute)) {
    return minute.replace('+', "'+");
  } else {
    return `${minute || 0}'`;
  }
}

function determineChainFromNetwork(
  network: 'POLYGON_MAINNET' | 'GNOSIS_MAINNET'
): SupportedChain {
  switch (network) {
    case 'POLYGON_MAINNET':
      return 'polygon';
    case 'GNOSIS_MAINNET':
      return 'gnosis';
    default:
      return null;
  }
}

type EventTeam = {
  id: number;
  name: string;
  shortName: string;
};

export type FormattedEvent = {
  id: number;
  shortName: string;
  name: string;
  type: EventType;
  startTime?: Date;
  endTime?: Date;
  minute: string;
  iconUrl?: string;
  state: 'CLOSED_FOR_BETTING' | 'IMPORTED' | 'RESOLVED' | 'SETTLED';
  outcome: [number, number];
  blockchainId?: number;
  version?: SupportedDistributorVersion;
  chain: SupportedChain;
  competitionName: string;
  eventBlockchainId: number;
  teamHome: EventTeam;
  teamAway: EventTeam;
};

export function formatEvent(event): FormattedEvent {
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
    minute,
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
    minute: formatMinute(minute),
    iconUrl: event_icon_url || null,
    state: event_state,
    outcome: outcome.length == 2 ? outcome : [0, 0],
    blockchainId: network_event_id?.event_id || null,
    version: network_event_id?.contract_version || null,
    chain: determineChainFromNetwork(network_event_id?.network),
    competitionName: event_competition_name || event_competition?.name,
    eventBlockchainId: event_competition?.id,
    teamHome: {
      id: team_home_id,
      name: team_home,
      shortName:
        abbreviationLookup[team_home.toLowerCase()] ||
        team_home.substr(0, 3).toUpperCase(),
    },
    teamAway: {
      id: team_away_id,
      name: team_away,
      shortName:
        abbreviationLookup[team_away.toLowerCase()] ||
        team_away.substr(0, 3).toUpperCase(),
    },
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

export type FormattedParticipant = {
  address: string;
  prediction: [number, number];
  wunderId: string;
  userName: string;
  profileName: string;
  points: number;
  stake: number;
  profit: number;
};

export function formatParticipant(participant): FormattedParticipant {
  if (!participant) return null;
  const {
    user_address,
    user_name,
    wunder_id,
    profile_name,
    home_score,
    away_score,
    points,
    stake,
    profit,
  } = participant;

  return {
    address: user_address,
    prediction: [home_score, away_score],
    wunderId: wunder_id,
    userName: user_name,
    profileName: profile_name,
    points: points,
    stake: stake,
    profit: profit,
  };
}

export type FormattedMember = {
  address: string;
  stake: string;
  wunderId: string;
  userName: string;
  profileName: string;
  profit: number;
  points: number;
};

export function formatMember(member, results): FormattedMember {
  if (!member) return null;
  const { address, user_name, wunder_id, profile_name, stake, profit } = member;
  const result = results.find(({ players_address }) =>
    compAddr(players_address, address)
  );

  return {
    address,
    stake: result?.stake || stake || 0,
    wunderId: wunder_id,
    userName: user_name,
    profileName: profile_name,
    profit: result?.cash_out || 0,
    points: result?.total_points || 0,
  };
}

export type FormattedGame = {
  id: number;
  state: 'UPCOMING' | 'LIVE' | 'HISTORIC';
  name: string;
  event: FormattedEvent;
  participants: FormattedParticipant[];
};

export function formatGame(game): FormattedGame {
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

export type FormattedCompetition = {
  competitionId: number;
  blockchainId: number;
  name: string;
  version: 'BETA' | 'GAMMA';
  poolAddress: string;
  isPublic: boolean;
  sponsored: boolean;
  games: FormattedGame[];
  members: FormattedMember[];
  payoutRule: PayoutRule;
  stake: number;
  maxMembers: number;
};

export function formatCompetition(competition): FormattedCompetition {
  if (!competition) return null;

  const {
    competition_id,
    tournament_id,
    name,
    version,
    pool_address,
    games = [],
    members = [],
    players_results = [],
    rule,
    public: isPublic,
    sponsored,
  } = competition;

  return {
    competitionId: competition_id,
    blockchainId: tournament_id,
    name,
    version,
    poolAddress: pool_address,
    isPublic,
    sponsored,
    games: games.map(formatGame)?.filter((g) => g),
    members: members
      .map((m) => formatMember(m, players_results))
      ?.filter((m) => m),
    payoutRule: rule?.payout_type,
    stake: Number(rule?.stake),
    maxMembers: rule?.max_members,
  };
}

export function calculatePoints(
  eventType: EventType,
  prediction: [number, number],
  result: [number, number]
) {
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

export function calculatePayout<R extends { points: number }>(
  payoutRule: PayoutRule,
  results: R[],
  stake: number
): (R & { profit: number })[] {
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
        profit: participant.points == maxPoints ? totalPot / winnerCount : 0,
      };
    });
    // Proportional
  } else if (payoutRule == 'PROPORTIONAL') {
    const totalPoints = results.reduce((a, b) => a + b.points, 0);
    const winningsPerPoint = totalPot / totalPoints;
    return results.map((participant) => {
      return {
        ...participant,
        profit:
          totalPoints == 0 ? stake : participant.points * winningsPerPoint,
      };
    });
  }
}

export function calculateWinnings(
  game: FormattedGame,
  stake: number,
  result: [number, number],
  payoutRule: PayoutRule
) {
  const { participants, event } = game;

  const results = participants.map((participant) => {
    const points = calculatePoints(event.type, participant.prediction, result);
    return { ...participant, points };
  });
  return calculatePayout(payoutRule, results, stake);
}

export function userIsParticipant(
  competition: FormattedCompetition,
  gameId: number,
  userAddress: string
) {
  return Boolean(
    competition?.games.find(
      (game) =>
        game.id == gameId &&
        game.participants.find((participant) =>
          compAddr(participant.address, userAddress)
        )
    )
  );
}
