import { ethers } from 'ethers';
import { httpProvider } from '../../../services/contract/provider';

export function initLauncherGamma(): [
  ethers.Contract,
  ethers.providers.JsonRpcProvider
] {
  const address = '0xAE32217Dc2d87c07C0885D69121B968C96d3E693';
  const abi = [
    'function createNewPool(string _poolName, uint256 _entryBarrier, string _tokenName, string _tokenSymbol, uint256 _invest)',
    'function allPools() view returns (address[])',
    'function poolsOfMember(address _member) view returns (address[])',
  ];
  const provider = httpProvider('polygon');
  return [new ethers.Contract(address, abi, provider), provider];
}

export function initPoolGamma(
  poolAddress
): [ethers.Contract, ethers.providers.JsonRpcProvider] {
  const abi = [
    'function name() public view returns(string)',
    'function entryBarrier() public view returns(uint)',
    'function governanceToken() public view returns(address)',
    'function poolMembers() public view returns(address[])',
    'function isMember(address) public view returns(bool)',
    'function getOwnedTokenAddresses() public view returns(address[] memory)',
    'function getOwnedNftAddresses() public view returns(address[] memory)',
    'function getOwnedNftTokenIds(address _contractAddress) public view returns(uint[])',
    'function joinPool(uint amount) public',
    'function fundPool(uint amount) external',
    'function createProposal(string memory _title, string memory _description, address _contractAddress, string memory _action, bytes memory _param, uint _transactionValue, uint _deadline) public',
    'function createMultiActionProposal(string memory _title, string memory _description, address[] memory _contractAddresses, string[] memory _actions, bytes[] memory _params, uint[] memory _transactionValues, uint _deadline) public',
    'function getAllProposalIds() public view returns(uint[] memory)',
    'function getProposal(uint _proposalId) public view returns(string memory title, string memory description, uint transactionCount, uint deadline, uint yesVotes, uint noVotes, uint totalVotes, uint createdAt, bool executed)',
    'function getProposalTransaction(uint _proposalId, uint _transactionIndex) public view returns(string memory action, bytes memory param, uint transactionValue, address contractAddress)',
    'function vote(uint proposalId, uint mode) public',
    'function hasVoted(uint256 proposalId, address account) public view returns (uint8)',
    'function executeProposal(uint _proposalId) public',
  ];
  const provider = httpProvider('polygon');
  return [new ethers.Contract(poolAddress, abi, provider), provider];
}
