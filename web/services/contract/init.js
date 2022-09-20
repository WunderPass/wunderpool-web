import { ethers } from 'ethers';
import { httpProvider, wsProvider } from './provider';

export const wunderSwapperAddress =
  '0xC89097B68AED3168c749395AD63B2079253CA599';
export const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

export const versionLookup = {
  '0x841397120D672F8C84FC19DDF1477666855bBB8A': {
    name: 'ALPHA',
    number: 1,
  },
  Alpha: { name: 'ALPHA', number: 1 },
  '0xc484B477BE6c3C58Fe3b4d3ede08BE96f47c5DEb': { name: 'BETA', number: 2 },
  Beta: { name: 'BETA', number: 2 },
  '0xAE32217Dc2d87c07C0885D69121B968C96d3E693': {
    name: 'GAMMA',
    number: 3,
  },
  Gamma: { name: 'GAMMA', number: 3 },
  '0xA40E3c0efA5a1Fa1C84aD7958e7aBf0Cf186809F': {
    name: 'DELTA',
    number: 4,
  },
  Delta: { name: 'DELTA', number: 4 },
  '0x4294FB86A22c3A89B2FA660de39e23eA91D5B35E': {
    name: 'EPSILON',
    number: 5,
  },
  Epsilon: { name: 'EPSILON', number: 5 },
  '0xB5Ae136D3817d8116Fce70Ac47e856fc484dafAe': {
    name: 'ZETA',
    number: 6,
  },
  Zeta: { name: 'ZETA', number: 6 },
};

export const latestVersion = { name: 'ZETA', number: 6 };

export const tokenAbi = [
  'function name() public view returns(string)',
  'function symbol() public view returns(string)',
  'function decimals() public view returns(uint)',
  'function balanceOf(address) public view returns(uint)',
  'function totalSupply() public view returns(uint)',
  'function price() public view returns(uint)',
  'function approve(address,uint)',
];
export const nftAbi = [
  'function name() public view returns(string)',
  'function symbol() public view returns(string)',
  'function balanceOf(address) public view returns(uint)',
  'function tokenURI(uint) public view returns(string)',
];

// export function initLauncher() {
//   const address = '0xAE32217Dc2d87c07C0885D69121B968C96d3E693';
//   const abi = [
//     'function createNewPool(string _poolName, uint256 _entryBarrier, string _tokenName, string _tokenSymbol, uint256 _invest)',
//     'function allPools() view returns (address[])',
//     'function poolsOfMember(address _member) view returns (address[])',
//   ];
//   const provider = httpProvider;
//   return [new ethers.Contract(address, abi, provider), provider];
// }

export function initPool(poolAddress) {
  const abi = [
    'function name() view returns(string)',
    'function entryBarrier() view returns(uint)',
    'function launcherAddress() view returns(address)',
    'function governanceToken() view returns(address)',
    'function poolMembers() view returns(address[])',
    'function isMember(address) view returns(bool)',
    'function getOwnedTokenAddresses() view returns(address[] memory)',
    'function getOwnedNftAddresses() view returns(address[] memory)',
    'function getOwnedNftTokenIds(address _contractAddress) view returns(uint[])',
    'function createProposal(string memory _title, string memory _description, address _contractAddress, string memory _action, bytes memory _param, uint _transactionValue, uint _deadline)',
    'function createMultiActionProposal(string memory _title, string memory _description, address[] memory _contractAddresses, string[] memory _actions, bytes[] memory _params, uint[] memory _transactionValues, uint _deadline)',
    'function getAllProposalIds() view returns(uint[] memory)',
    'function getProposal(uint _proposalId) view returns(string memory title, string memory description, uint transactionCount, uint deadline, uint yesVotes, uint noVotes, uint totalVotes, uint createdAt, bool executed)',
    'function getProposalTransaction(uint _proposalId, uint _transactionIndex) view returns(string memory action, bytes memory param, uint transactionValue, address contractAddress)',
    'function vote(uint proposalId, uint mode)',
    'function hasVoted(uint256 proposalId, address account) view returns (uint)',
    'function executeProposal(uint _proposalId)',
  ];
  const provider = httpProvider;
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}

export function initPoolSocket(poolAddress) {
  const abi = [
    'event NewProposal(uint indexed id, address indexed creator, string title)',
    'event Voted(uint indexed proposalId, address indexed voter, uint mode)',
    'event ProposalExecuted(uint indexed proposalId, address indexed executor, bytes[] result)',
    'event NewMember(address indexed memberAddress, uint stake)',
    'event TokenAdded(address indexed tokenAddress, bool _isERC721, uint _tokenId)',
    'event MaticWithdrawed(address indexed receiver, uint amount)',
    'event TokensWithdrawed(address indexed tokenAddress, address indexed receiver, uint amount)',
  ];

  const provider = wsProvider;
  const wunderPool = new ethers.Contract(poolAddress, abi, provider);

  return [wunderPool, provider];
}

export function connectContract(contract) {
  const wallet = new ethers.Wallet(process.env.EXECUTE_KEY, httpProvider);
  return contract.connect(wallet);
}

export async function gasPrice() {
  const currentPrice = await httpProvider.getGasPrice();
  return currentPrice.mul(3);
}
