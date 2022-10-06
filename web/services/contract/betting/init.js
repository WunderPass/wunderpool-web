import { ethers } from 'ethers';
import { httpProvider, wsProvider } from '../provider';

export const distributorAddress = '0x1189fB98a6f7eb5e59bA3a16AD9668Fe48D06a3D';

export function initDistributor() {
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
  const provider = httpProvider;
  return [new ethers.Contract(distributorAddress, abi, provider), provider];
}

export function initDistributorSocket() {
  const abi = [
    'event NewEvent(uint256 indexed id, string name, uint256 endDate)',
    'event NewGame(uint256 indexed id, string name, uint256 eventId)',
    'event NewParticipant(uint256 indexed eventId, uint256 indexed gameId, address addr)',
    'event GameClosed(uint256 indexed gameId)',
  ];

  const provider = wsProvider;
  const distributor = new ethers.Contract(distributorAddress, abi, provider);

  return [distributor, provider];
}
