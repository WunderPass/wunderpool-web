import { ethers } from 'ethers';
import { httpProvider } from '../../../services/contract/provider';

export function initProposalEpsilon(): [
  ethers.Contract,
  ethers.providers.JsonRpcProvider
] {
  const address = '0x2A68Dfe9c586DDb209aB3895B85eA6f9804F1551';
  const abi = [
    'function calculateVotes(address _pool, uint256 _proposalId) view returns (uint256 yesVotes, uint256 noVotes, uint256 yesVoters, uint256 noVoters)',
    'function getProposal(address _pool, uint256 _proposalId) view returns (string title, string description, uint256 transactionCount, uint256 deadline, uint256 yesVotes, uint256 noVotes, uint256 totalVotes, uint256 createdAt, bool executed, address creator)',
    'function getProposalTransaction(address _pool, uint256 _proposalId, uint256 _transactionIndex) view returns (string action, bytes param, uint256 transactionValue, address contractAddress)',
    'function hasVoted(address _pool, uint256 _proposalId, address _account) view returns (uint8)',
    'function proposalExecutable(address _pool, uint256 _proposalId) view returns (bool executable, string errorMessage)',
  ];
  const provider = httpProvider('polygon');
  return [new ethers.Contract(address, abi, provider), provider];
}
