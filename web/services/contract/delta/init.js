import { ethers } from 'ethers';
import { httpProvider } from '/services/contract/provider';

export function initLauncherDelta() {
  const address = '0xA40E3c0efA5a1Fa1C84aD7958e7aBf0Cf186809F';
  const abi = [
    'function allPools() view returns (address[])',
    'function createNewPool(string _poolName, uint256 _entryBarrier, string _tokenName, string _tokenSymbol, uint256 _tokenPrice, address _creator)',
    'function poolsOfMember(address _member) view returns (address[])',
    'function whiteListedPoolsOfMember(address _member) view returns (address[])',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(address, abi, provider), provider];
}

export function initPoolDelta(poolAddress) {
  const abi = [
    'function name() view returns(string)',
    'function entryBarrier() view returns(uint)',
    'function poolClosed() view returns(bool)',
    'function governanceToken() view returns(address)',
    'function poolMembers() view returns(address[])',
    'function isWhiteListed(address user) view returns(bool)',
    'function isMember(address) view returns(bool)',
    'function getOwnedTokenAddresses() view returns(address[] memory)',
    'function getOwnedNftAddresses() view returns(address[] memory)',
    'function getOwnedNftTokenIds(address _contractAddress) view returns(uint[])',
    'function joinForUser(uint256 _amount, address _user)',
    'function addToWhiteListForUser(address _user, address _newMember, bytes memory _signature)',
    'function fundPool(uint amount) external',
    'function createProposalForUser(address _user, string memory _title, string memory _description, address[] memory _contractAddresses, string[] memory _actions, bytes[] memory _params, uint256[] memory _transactionValues, uint256 _deadline, bytes memory _signature)',
    'function getAllProposalIds() view returns(uint[] memory)',
    'function voteForUser(address _user, uint256 _proposalId, uint256 _mode, bytes memory _signature)',
    'function executeProposal(uint _proposalId)',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}

export function initProposalDelta() {
  const address = '0xD92C084A562B21Cc0F6098A3e97fed5357fe2947';
  const abi = [
    'function calculateVotes(address _pool, uint256 _proposalId) view returns (uint256 yesVotes, uint256 noVotes)',
    'function getProposal(address _pool, uint256 _proposalId) view returns (string title, string description, uint256 transactionCount, uint256 deadline, uint256 yesVotes, uint256 noVotes, uint256 totalVotes, uint256 createdAt, bool executed)',
    'function getProposalTransaction(address _pool, uint256 _proposalId, uint256 _transactionIndex) view returns (string action, bytes param, uint256 transactionValue, address contractAddress)',
    'function hasVoted(address _pool, uint256 _proposalId, address _account) view returns (uint8)',
    'function proposalExecutable(address _pool, uint256 _proposalId) view returns (bool executable, string errorMessage)',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(address, abi, provider), provider];
}
