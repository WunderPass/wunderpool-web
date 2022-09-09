import axios from 'axios';
import { ethers } from 'ethers';
import useWunderPass from '/hooks/useWunderPass';
import {
  createApeSuggestionDelta,
  createFudSuggestionDelta,
  createLiquidateSuggestionDelta,
  createNftBuyProposalDelta,
  createNftSellProposalDelta,
  createSwapSuggestionDelta,
  fetchPoolProposalsDelta,
  fetchTransactionDataDelta,
  isLiquidateProposalDelta,
  proposalExecutableDelta,
} from './delta/proposals';
import {
  createNftBuyProposalEpsilon,
  createNftSellProposalEpsilon,
  fetchTransactionDataEpsilon,
  isLiquidateProposalEpsilon,
  proposalExecutableEpsilon,
} from './epsilon/proposals';
import {
  createApeSuggestionGamma,
  createFudSuggestionGamma,
  createLiquidateSuggestionGamma,
  createNftBuyProposalGamma,
  createNftSellProposalGamma,
  createSwapSuggestionGamma,
  executeProposalGamma,
  fetchPoolProposalsGamma,
  fetchTransactionDataGamma,
  isLiquidateProposalGamma,
  proposalExecutableGamma,
} from './gamma/proposals';
import { usdcAddress } from './init';
import { waitForTransaction } from './provider';

function formatProposal(
  {
    title,
    description,
    proposal_action,
    user_address,
    proposal_id,
    created_at,
    deadline,
    state,
    votings,
  },
  userAddress
) {
  const userVoting =
    votings.find(
      (v) => v.user_address.toLowerCase() == userAddress.toLowerCase()
    ) || {};

  var deadlineDate = new Date(deadline);
  var deadlineUTC2 = Date.UTC(
    deadlineDate.getUTCFullYear(),
    deadlineDate.getUTCMonth(),
    deadlineDate.getUTCDate(),
    deadlineDate.getUTCHours() + 2, //hardcoded for UTC+2
    deadlineDate.getUTCMinutes(),
    deadlineDate.getUTCSeconds()
  );

  var created_at_date = new Date(created_at);
  var created_at_UTC2 = Date.UTC(
    created_at_date.getUTCFullYear(),
    created_at_date.getUTCMonth(),
    created_at_date.getUTCDate(),
    created_at_date.getUTCHours() + 2, //hardcoded for UTC+2
    created_at_date.getUTCMinutes(),
    created_at_date.getUTCSeconds()
  );

  return {
    id: proposal_id,
    title,
    description,
    action: proposal_action,
    deadline: new Date(deadlineUTC2).getTime(),
    votings,
    createdAt: new Date(created_at_UTC2).getTime(),
    executed: state == 'EXECUTED',
    executable: false,
    declined: state == 'DECLINED',
    creator: user_address,
    hasVoted: userVoting.vote ? (userVoting.vote == 'YES' ? 1 : 2) : 0,
  };
}

export function fetchPoolProposals(address, userAddress, version) {
  if (version > 4) {
    return new Promise(async (resolve, reject) => {
      axios({ url: `/api/proxy/pools/proposals?address=${address}` })
        .then(({ data }) => {
          resolve(
            data.map((proposal) => formatProposal(proposal, userAddress))
          );
        })
        .catch((err) => reject(err));
    });
  } else if (version > 3) {
    return fetchPoolProposalsDelta(address, userAddress);
  } else {
    return fetchPoolProposalsGamma(address, userAddress);
  }
}

export function fetchTransactionData(address, id, transactionCount, version) {
  if (version > 4) {
    return fetchTransactionDataEpsilon(address, id, transactionCount);
  } else if (version > 3) {
    return fetchTransactionDataDelta(address, id, transactionCount);
  } else {
    return fetchTransactionDataGamma(address, id, transactionCount);
  }
}

function createBackendProposal(userAddress, options) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
      userAddress,
    });
    const popup = openPopup('sign');
    const proposal = await axios({
      url: '/api/proxy/pools/proposals/request',
      params: options,
    });

    const {
      title,
      description,
      proposal_action,
      pool_address,
      user_address,
      proposal_id,
      contract_addresses,
      actions,
      params,
      transaction_values,
    } = proposal.data;
    const types = [
      'address',
      'address',
      'string',
      'string',
      'address[]',
      'string[]',
      'bytes[]',
      'uint[]',
      'uint',
    ];
    const values = [
      user_address,
      pool_address,
      title,
      description,
      contract_addresses,
      actions,
      params,
      transaction_values,
      proposal_id,
    ];
    sendSignatureRequest(types, values, false, popup)
      .then((sig) => {
        axios({
          method: 'post',
          url: '/api/proxy/pools/proposals/create',
          params: { address: pool_address },
          data: {
            title,
            description,
            signature: sig.signature,
            proposal_action,
            pool_address,
            user_address,
            proposal_id,
            contract_addresses,
            actions,
            params,
            transaction_values,
          },
        })
          .then((res) => {
            waitForTransaction(res.data)
              .then((tx) => {
                console.log(tx);
                resolve(tx);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createApeSuggestion(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress,
  version
) {
  if (version > 4) {
    return createSwapSuggestion(
      poolAddress,
      usdcAddress,
      6,
      tokenAddress,
      title,
      description,
      value,
      userAddress,
      version
    );
  } else if (version > 3) {
    return createApeSuggestionDelta(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress
    );
  } else {
    return createApeSuggestionGamma(
      poolAddress,
      tokenAddress,
      title,
      description,
      value
    );
  }
}

export function createFudSuggestion(
  poolAddress,
  tokenAddress,
  tokenDecimals,
  title,
  description,
  value,
  userAddress,
  version
) {
  if (version > 4) {
    return createSwapSuggestion(
      poolAddress,
      tokenAddress,
      tokenDecimals,
      usdcAddress,
      title,
      description,
      value,
      userAddress,
      version
    );
  } else if (version > 3) {
    return createFudSuggestionDelta(
      poolAddress,
      tokenAddress,
      title,
      description,
      ethers.utils.parseUnits(value, tokenDecimals),
      userAddress
    );
  } else {
    return createFudSuggestionGamma(
      poolAddress,
      tokenAddress,
      title,
      description,
      ethers.utils.parseUnits(value, tokenDecimals)
    );
  }
}

export function createLiquidateSuggestion(
  poolAddress,
  title,
  description,
  userAddress,
  version
) {
  if (version > 4) {
    return createBackendProposal(userAddress, {
      address: poolAddress,
      action: 'LIQUIDATE_POOL',
      title,
      description,
      userAddress,
    });
  } else if (version > 3) {
    return createLiquidateSuggestionDelta(
      poolAddress,
      title,
      description,
      userAddress
    );
  } else {
    return createLiquidateSuggestionGamma(poolAddress, title, description);
  }
}

export async function createSwapSuggestion(
  poolAddress,
  tokenIn,
  tokenInDecimals,
  tokenOut,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 4) {
    return createBackendProposal(userAddress, {
      address: poolAddress,
      action: 'SWAP_TOKEN',
      title,
      description,
      userAddress,
      balance: amount,
      tokenIn,
      tokenInDecimals,
      tokenOut,
    });
  } else if (version > 3) {
    return createSwapSuggestionDelta(
      poolAddress,
      tokenIn,
      tokenOut,
      title,
      description,
      amount,
      userAddress
    );
  } else {
    return createSwapSuggestionGamma(
      poolAddress,
      tokenIn,
      tokenOut,
      title,
      description,
      amount
    );
  }
}

export async function createNftBuyProposal(
  poolAddress,
  nftAddress,
  tokenId,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 4) {
    return createNftBuyProposalEpsilon(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress,
      version
    );
  } else if (version > 3) {
    return createNftBuyProposalDelta(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress,
      version
    );
  } else {
    return createNftBuyProposalGamma(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress,
      version
    );
  }
}

export async function createNftSellProposal(
  poolAddress,
  nftAddress,
  tokenId,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 4) {
    return createNftSellProposalEpsilon(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress
    );
  } else if (version > 3) {
    return createNftSellProposalDelta(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress
    );
  } else {
    return createNftSellProposalGamma(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress
    );
  }
}

export function proposalExecutable(poolAddress, id, version) {
  if (version > 4) {
    return proposalExecutableEpsilon(poolAddress, id);
  } else if (version > 3) {
    return proposalExecutableDelta(poolAddress, id);
  } else {
    return proposalExecutableGamma(poolAddress, id);
  }
}

export function executeProposal(poolAddress, id, version = null) {
  return executeProposalGamma(poolAddress, id, version);
}

export function isLiquidateProposal(poolAddress, id, version) {
  if (version > 4) {
    return isLiquidateProposalEpsilon(poolAddress, id);
  } else if (version > 3) {
    return isLiquidateProposalDelta(poolAddress, id);
  } else {
    return isLiquidateProposalGamma(poolAddress, id);
  }
}
