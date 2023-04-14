import { SupportedDistributorVersion, SupportedChain } from './../types';
import { ethers } from 'ethers';
import { httpProvider } from '../provider';

export function distributorAddress(
  version: SupportedDistributorVersion,
  chain: SupportedChain
) {
  switch (version) {
    case 'ALPHA':
      if (chain == 'polygon')
        return '0x1189fB98a6f7eb5e59bA3a16AD9668Fe48D06a3D';
      break;
    case 'BETA':
      if (chain == 'polygon')
        return '0x1Ec1144ccCDE222449A02288d5eC1C22960CaCDc';
      break;
    case 'GAMMA':
      if (chain == 'polygon')
        return '0x391A85d291Faa9626a3F3e6512485A05Ad68C0Df';
      if (chain == 'gnosis')
        return '0x845812905256FFA8B16b355Bc11A3f3e63c55aB8';
      break;
    default:
      throw `Invalid Version: ${version}`;
  }
  throw `Distributor Version ${version} does not exist on chain ${chain}`;
}

function initDistributorAlpha(
  chain: SupportedChain
): [ethers.Contract, ethers.providers.Provider] {
  const abi = [
    'function registerEvent(string calldata _name, uint256 _endDate, uint8 _eventType)',
    'function registerGame(string calldata _name, uint256 _stake, address _tokenAddress, uint256 _eventId, uint8 _payoutRule)',
    'function getEvent(uint256 _id) public view returns (tuple(uint256 id, string name, uint256 endDate, uint8 eventType, address owner, bool resolved, uint256[] outcome,))',
    'function getGame(uint256 _id) public view returns (tuple(uint256 id, string name, uint256 stake, address tokenAddress, bool closed, uint256 eventId, uint8 payoutRule, tuple(address addr, uint256[] prediction)[] participants))',
    'function closedEvents() public view returns (uint256[] memory)',
    'function closedGames() public view returns (uint256[] memory)',
    'function registerParticipantForUser(uint256 _id, uint256[] memory _prediction, address _participant, bytes memory _signature)',
    'function setEventOutcome(uint256 _id, uint256[] memory _outcome)',
    'function determineGame(uint256 _id)',
    'function clearReservedAmounts(uint256 _id)',
  ];
  const provider = httpProvider(chain);
  return [
    new ethers.Contract(distributorAddress('ALPHA', chain), abi, provider),
    provider,
  ];
}

function initDistributorBeta(
  chain: SupportedChain
): [ethers.Contract, ethers.providers.Provider] {
  const abi = [
    'function registerEvent(string calldata _name, uint256 _startDate, uint256 _endDate, uint8 _eventType)',
    'function registerGame(string calldata _name, uint256 _stake, address _tokenAddress, uint256 _eventId, uint8 _payoutRule, bool _checkApproval)',
    'function getEvent(uint256 _id) public view returns (tuple(uint256 id, string name, uint256 startDate, uint256 endDate, uint8 eventType, address owner, bool resolved, uint256[] outcome))',
    'function getGame(uint256 _id) public view returns (tuple(uint256 id, string name, uint256 stake, address tokenAddress, bool closed, uint256 eventId, uint8 payoutRule, bool checkApproval, tuple(address addr, uint256[] prediction)[] participants))',
    'function closedEvents() public view returns (uint256[] memory)',
    'function closedGames() public view returns (uint256[] memory)',
    'function registerParticipantForUser(uint256 _id, uint256[] memory _prediction, address _participant, bytes memory _signature)',
    'function setEventOutcome(uint256 _id, uint256[] memory _outcome)',
    'function determineGame(uint256 _id)',
    'function clearReservedAmounts(uint256 _id)',
  ];
  const provider = httpProvider(chain);
  return [
    new ethers.Contract(distributorAddress('BETA', chain), abi, provider),
    provider,
  ];
}

function initDistributorGamma(
  chain: SupportedChain
): [ethers.Contract, ethers.providers.Provider] {
  const abi = [
    'function closedEvents() view returns (uint256[])',
    'function closedTournaments() view returns (uint256[])',
    'function currentEventId() view returns (uint256)',
    'function currentGameId() view returns (uint256)',
    'function currentTournamentId() view returns (uint256)',
    'function determineTournament(uint256 _id)',
    'function getEvent(uint256 _id) view returns (tuple(string name, uint256 startDate, uint256 endDate, uint8 eventType, address owner, bool resolved, uint256[] outcome, bool exists))',
    'function getGame(uint256 _id) view returns (tuple(uint256 id, uint256 eventId, tuple(address addr, uint256[] prediction)[] participants))',
    'function getTournament(uint256 _id) view returns (tuple(string name, uint256 stake, address tokenAddress, bool closed, uint8 payoutRule, bool checkApproval, uint256[] gameIds, address[] members))',
    'function placeBet(uint256 _tournamentId, uint256[] _gameIds, uint256[][] _predictions)',
    'function placeBetForUser(uint256 _tournamentId, uint256[] _gameIds, uint256[][] _predictions, address _participant, bytes _signature)',
    'function registerEvent(string _name, uint256 _startDate, uint256 _endDate, uint8 _eventType)',
    'function registerTournament(string _name, uint256 _stake, address _tokenAddress, uint256[] _eventIds, uint8 _payoutRule, bool _checkApproval)',
    'function setEventOutcome(uint256 _id, uint256[] _outcome)',
    'function simulateTournament(uint256 _id) view returns (tuple(address addr, uint256 points)[][] gamePoints, tuple(address addr, uint256 points)[] totalPoints)',
    'function updateEvent(uint256 _eventId, string _name, uint256 _startDate, uint256 _endDate)',
  ];
  const provider = httpProvider(chain);
  return [
    new ethers.Contract(distributorAddress('GAMMA', chain), abi, provider),
    provider,
  ];
}

export function initDistributor(
  version: SupportedDistributorVersion,
  chain: SupportedChain
): [ethers.Contract, ethers.providers.Provider] {
  if (version == 'ALPHA') return initDistributorAlpha(chain);
  if (version == 'BETA') return initDistributorBeta(chain);
  if (version == 'GAMMA') return initDistributorGamma(chain);
  throw `Unsupported Version: ${version}`;
}
