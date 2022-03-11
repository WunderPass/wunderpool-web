import { ethers } from "ethers";

export function initLauncher() {
  const address = "0xc484B477BE6c3C58Fe3b4d3ede08BE96f47c5DEb"
  const abi = [
    "function createNewPool(string memory _poolName, uint _entryBarrier, string memory _tokenName, string memory _tokenSymbol) public payable", 
    "function allPools() public view returns(address[])",
    "function poolsOfMember(address _member) public view returns(address[])"
  ]
  const provider = new ethers.providers.AlchemyProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
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
    "function enterPool() public payable",
    "function createProposal(string memory _title, string memory _description, address _contractAddress, string memory _action, bytes memory _param, uint _transactionValue, uint _deadline) public",
    "function createMultiActionProposal(string memory _title, string memory _description, address[] memory _contractAddresses, string[] memory _actions, bytes[] memory _params, uint[] memory _transactionValues, uint _deadline) public",
    "function getAllProposalIds() public view returns(uint[] memory)", 
    "function getProposal(uint _proposalId) public view returns(string memory title, string memory description, uint transactionCount, uint deadline, uint yesVotes, uint noVotes, uint totalVotes, uint createdAt, bool executed)",
    "function getProposalTransaction(uint _proposalId, uint _transactionIndex) public view returns(string memory action, bytes memory param, uint transactionValue, address contractAddress)",
    "function vote(uint proposalId, uint mode) public",
    "function hasVoted(uint256 proposalId, address account) public view returns (uint)",
    "function executeProposal(uint _proposalId) public"
  ]
  const provider = new ethers.providers.AlchemyProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}

export function initPoolSocket(poolAddress) {
  const abi = [
    "event NewProposal(uint indexed id, address indexed creator, string title)", 
    "event Voted(uint indexed proposalId, address indexed voter, uint mode)", 
    "event ProposalExecuted(uint indexed proposalId, address indexed executor, bytes[] result)",
    "event TokenAdded(address indexed tokenAddress, uint balance)",
    "event MaticWithdrawed(address indexed receiver, uint amount)",
    "event TokensWithdrawed(address indexed tokenAddress, address indexed receiver, uint amount)"
  ]
  
  const provider = ethers.providers.AlchemyProvider.getWebSocketProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
  const wunderPool = new ethers.Contract(poolAddress, abi, provider);

  return [wunderPool, provider];
}
