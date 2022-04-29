import { ethers } from "ethers";

export const httpProvider = new ethers.providers.AlchemyProvider(
  process.env.BLOCKCHAIN_NAME,
  process.env.ALCHEMY_API_KEY
);
export const wsProvider = ethers.providers.AlchemyProvider.getWebSocketProvider(
  process.env.BLOCKCHAIN_NAME,
  process.env.ALCHEMY_API_KEY
);
export const wunderSwapperAddress =
  "0xB2BfcfA4d937ac850edCBeC7BaeC7A1b68f2ccfd";
export const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const tokenAbi = [
  "function name() public view returns(string)",
  "function symbol() public view returns(string)",
  "function decimals() public view returns(uint)",
  "function balanceOf(address) public view returns(uint)",
  "function totalSupply() public view returns(uint)",
  "function price() public view returns(uint)",
];
export const nftAbi = [
  "function name() public view returns(string)",
  "function symbol() public view returns(string)",
  "function balanceOf(address) public view returns(uint)",
  "function tokenURI(uint) public view returns(string)",
];

export function initLauncher() {
  const address = "0xAE32217Dc2d87c07C0885D69121B968C96d3E693";
  const abi = [
    "function createNewPool(string _poolName, uint256 _entryBarrier, string _tokenName, string _tokenSymbol, uint256 _invest)",
    "function allPools() view returns (address[])",
    "function poolsOfMember(address _member) view returns (address[])",
  ];
  const provider = httpProvider;
  return [new ethers.Contract(address, abi, provider), provider];
}

export function initPool(poolAddress) {
  const abi = [
    "function name() public view returns(string)",
    "function entryBarrier() public view returns(uint)",
    "function governanceToken() public view returns(address)",
    "function poolMembers() public view returns(address[])",
    "function isMember(address) public view returns(bool)",
    "function getOwnedTokenAddresses() public view returns(address[] memory)",
    "function getOwnedNftAddresses() public view returns(address[] memory)",
    "function getOwnedNftTokenIds(address _contractAddress) public view returns(uint[])",
    "function joinPool(uint amount) public",
    "function fundPool(uint amount) external",
    "function createProposal(string memory _title, string memory _description, address _contractAddress, string memory _action, bytes memory _param, uint _transactionValue, uint _deadline) public",
    "function createMultiActionProposal(string memory _title, string memory _description, address[] memory _contractAddresses, string[] memory _actions, bytes[] memory _params, uint[] memory _transactionValues, uint _deadline) public",
    "function getAllProposalIds() public view returns(uint[] memory)",
    "function getProposal(uint _proposalId) public view returns(string memory title, string memory description, uint transactionCount, uint deadline, uint yesVotes, uint noVotes, uint totalVotes, uint createdAt, bool executed)",
    "function getProposalTransaction(uint _proposalId, uint _transactionIndex) public view returns(string memory action, bytes memory param, uint transactionValue, address contractAddress)",
    "function vote(uint proposalId, uint mode) public",
    "function hasVoted(uint256 proposalId, address account) public view returns (uint)",
    "function executeProposal(uint _proposalId) public",
  ];
  const provider = httpProvider;
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}

export function initPoolSocket(poolAddress) {
  const abi = [
    "event NewProposal(uint indexed id, address indexed creator, string title)",
    "event Voted(uint indexed proposalId, address indexed voter, uint mode)",
    "event ProposalExecuted(uint indexed proposalId, address indexed executor, bytes[] result)",
    "event NewMember(address indexed memberAddress, uint stake)",
    "event TokenAdded(address indexed tokenAddress, bool _isERC721, uint _tokenId)",
    "event MaticWithdrawed(address indexed receiver, uint amount)",
    "event TokensWithdrawed(address indexed tokenAddress, address indexed receiver, uint amount)",
  ];

  const provider = wsProvider;
  const wunderPool = new ethers.Contract(poolAddress, abi, provider);

  return [wunderPool, provider];
}

export async function gasPrice() {
  const currentPrice = await httpProvider.getGasPrice();
  return currentPrice.mul(3);
}
