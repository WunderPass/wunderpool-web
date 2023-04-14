import { SupportedChain, VersionInfo } from './types';
import { ethers } from 'ethers';
import { httpProvider } from './provider';

export const wunderSwapperAddress = (chain: SupportedChain) => {
  switch (chain) {
    case 'polygon':
      return '0xC89097B68AED3168c749395AD63B2079253CA599';
    case 'gnosis':
      return '0x79b1DFCc457c9aFF5124b51dF3F38101ef20A1E5';
    default:
      throw `Unsupported Chain: ${chain}`;
  }
};

export const usdcAddress = (chain: SupportedChain) => {
  switch (chain) {
    case 'polygon':
      return '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    case 'gnosis':
      return '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83';
    default:
      throw `Unsupported Chain: ${chain}`;
  }
};

export const versionLookup: {
  [address: string]: VersionInfo;
} = {
  '0x841397120D672F8C84FC19DDF1477666855bBB8A': {
    name: 'ALPHA',
    number: 1,
    chain: 'polygon',
  },
  alpha: { name: 'ALPHA', number: 1 },
  '0xc484B477BE6c3C58Fe3b4d3ede08BE96f47c5DEb': {
    name: 'BETA',
    number: 2,
    chain: 'polygon',
  },
  beta: { name: 'BETA', number: 2 },
  '0xAE32217Dc2d87c07C0885D69121B968C96d3E693': {
    name: 'GAMMA',
    number: 3,
    chain: 'polygon',
  },
  gamma: { name: 'GAMMA', number: 3 },
  '0xA40E3c0efA5a1Fa1C84aD7958e7aBf0Cf186809F': {
    name: 'DELTA',
    number: 4,
    chain: 'polygon',
  },
  delta: { name: 'DELTA', number: 4 },
  '0x4294FB86A22c3A89B2FA660de39e23eA91D5B35E': {
    name: 'EPSILON',
    number: 5,
    chain: 'polygon',
  },
  epsilon: { name: 'EPSILON', number: 5 },
  '0xB5Ae136D3817d8116Fce70Ac47e856fc484dafAe': {
    name: 'ZETA',
    number: 6,
    chain: 'polygon',
  },
  zeta: { name: 'ZETA', number: 6 },
  '0x8c3B8456077F0A853c667BF18F4B77E4B3Ca0cB1': {
    name: 'ETA',
    number: 7,
    chain: 'polygon',
  },
  eta: { name: 'ETA', number: 7 },
  '0xbB7dAdDD024Ab49309915Fb1d0c80a259A2Db31B': {
    name: 'ETA',
    number: 7,
    chain: 'gnosis',
  },
};

export const latestVersion = { name: 'ETA', number: 7 };

export const tokenAbi = [
  'function name() public view returns(string)',
  'function symbol() public view returns(string)',
  'function decimals() public view returns(uint)',
  'function balanceOf(address) public view returns(uint)',
  'function totalSupply() public view returns(uint)',
  'function price() public view returns(uint)',
  'function allowance(address, address) public view returns(uint)',
  'function approve(address,uint)',
  'function transfer(address,uint)',
];

export function initPool(
  poolAddress: string,
  chain: SupportedChain
): [ethers.Contract, ethers.providers.JsonRpcProvider] {
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
  const provider = httpProvider(chain);
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}

export function connectContract(
  contract: ethers.Contract,
  chain: SupportedChain
) {
  const wallet = new ethers.Wallet(
    process.env.EXECUTE_KEY,
    httpProvider(chain)
  );
  return contract.connect(wallet);
}

export async function gasPrice(chain: SupportedChain) {
  const currentPrice = await httpProvider(chain).getGasPrice();
  return currentPrice.mul(3);
}
