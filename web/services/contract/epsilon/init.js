import { ethers } from 'ethers';
import { httpProvider } from '/services/contract/provider';

export function initLauncherEpsilon() {
  const address = '0x34645Cb6b71A4513AC3e3D9683DF48142114e55B';
  const abi = [
    'function allPools() view returns (address[])',
    'function createNewPool(string _poolName, string _tokenName, string _tokenSymbol, uint256 _amount, address _creator, address[] _members, uint256 _minInvest, uint256 _maxInvest, uint256 _maxMembers, uint8 _votingThreshold, uint256 _votingTime, uint256 _minYesVoters)',
    'function poolsOfMember(address _member) view returns (address[])',
    'function whiteListedPoolsOfMember(address _member) view returns (address[])',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(address, abi, provider), provider];
}

export function initPoolEpsilon(poolAddress) {
  const abi = [
    'function name() view returns (string)',
    'function poolClosed() view returns (bool)',
    'function addToWhiteListForUser(address _user, address _newMember, bytes _signature)',
    'function addToWhiteListWithSecret(address _user, bytes32 _hashedSecret, uint256 _validForCount, bytes _signature)',
    'function createJoinProposal(address _user, string _title, string _description, uint256 _amount, uint256 _governanceTokens)',
    'function createProposalForUser(address _user, string _title, string _description, address[] _contractAddresses, string[] _actions, bytes[] _params, uint256[] _transactionValues, bytes _signature)',
    'function executeProposal(uint256 _proposalId)',
    'function fundPool(uint256 _amount)',
    'function getAllProposalIds() view returns (uint256[])',
    'function getOwnedNftAddresses() view returns (address[])',
    'function getOwnedNftTokenIds(address _contractAddress) view returns (uint256[])',
    'function getOwnedTokenAddresses() view returns (address[])',
    'function governanceToken() view returns (address)',
    'function governanceTokenPrice() view returns (uint256 price)',
    'function governanceTokensOf(address _user) view returns (uint256 balance)',
    'function investOfUser(address) view returns (uint256)',
    'function isMember(address _maybeMember) view returns (bool)',
    'function isWhiteListed(address _user) view returns (bool)',
    'function joinForUser(uint256 _amount, address _user, string _secret)',
    'function launcherAddress() view returns (address)',
    'function ownedTokenLookup(address) view returns (bool)',
    'function poolMembers() view returns (address[])',
    'function removeNft(address _tokenAddress, uint256 _tokenId)',
    'function totalGovernanceTokens() view returns (uint256 balance)',
    'function voteForUser(address _user, uint256 _proposalId, uint256 _mode, bytes _signature)',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}

export function initProposalEpsilon() {
  const address = '0x0BfCa025a400300d50C89bFD49961eB127480D07';
  const abi = [
    'function calculateVotes(address _pool, uint256 _proposalId) view returns (uint256 yesVotes, uint256 noVotes, uint256 yesVoters, uint256 noVoters)',
    'function getProposal(address _pool, uint256 _proposalId) view returns (string title, string description, uint256 transactionCount, uint256 deadline, uint256 yesVotes, uint256 noVotes, uint256 totalVotes, uint256 createdAt, bool executed, address creator)',
    'function getProposalTransaction(address _pool, uint256 _proposalId, uint256 _transactionIndex) view returns (string action, bytes param, uint256 transactionValue, address contractAddress)',
    'function hasVoted(address _pool, uint256 _proposalId, address _account) view returns (uint8)',
    'function proposalExecutable(address _pool, uint256 _proposalId) view returns (bool executable, string errorMessage)',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(address, abi, provider), provider];
}

export function initPoolConfigEpsilon() {
  const address = '0xBdF6B08B6E533864a3F1cf24760DD5D8776140a8';
  const abi = [
    'function getConfig(address _pool) view returns (uint256 _minInvest, uint256 _maxInvest, uint256 _maxMembers, uint8 _votingThreshold, uint256 _votingTime, uint256 _minYesVoters)',
    'function maxInvest(address _pool) view returns (uint256)',
    'function maxMembers(address _pool) view returns (uint256)',
    'function memberCanJoin(address _pool, uint256 _amount, uint256 _invested, uint256 _tokenPrice, uint256 _members) view returns (bool, string)',
    'function minInvest(address _pool) view returns (uint256)',
    'function minYesVoters(address _pool) view returns (uint256)',
    'function votingThreshold(address _pool) view returns (uint8)',
    'function votingTime(address _pool) view returns (uint256)',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(address, abi, provider), provider];
}
