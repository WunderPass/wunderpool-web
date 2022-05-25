import {
  createApeSuggestionDelta,
  createCustomProposalDelta,
  createFudSuggestionDelta,
  createLiquidateSuggestionDelta,
  createMultiActionProposalDelta,
  createNftBuyProposalDelta,
  createNftSellProposalDelta,
  createSwapSuggestionDelta,
  executeProposalDelta,
  fetchPoolProposalsDelta,
  fetchTransactionDataDelta,
} from './delta/proposals';
import {
  createApeSuggestionGamma,
  createCustomProposalGamma,
  createFudSuggestionGamma,
  createLiquidateSuggestionGamma,
  createMultiActionProposalGamma,
  createNftBuyProposalGamma,
  createNftSellProposalGamma,
  createSwapSuggestionGamma,
  executeProposalGamma,
  fetchPoolProposalsGamma,
  fetchTransactionDataGamma,
} from './gamma/proposals';

export function fetchPoolProposals(address, version) {
  if (version > 3) {
    return fetchPoolProposalsDelta(address);
  } else {
    return fetchPoolProposalsGamma(address);
  }
}

export function fetchTransactionData(address, id, transactionCount, version) {
  if (version > 3) {
    return fetchTransactionDataDelta(address, id, transactionCount);
  } else {
    return fetchTransactionDataGamma(address, id, transactionCount);
  }
}

export function createMultiActionProposal(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  deadline,
  userAddress,
  version
) {
  if (version > 3) {
    return createMultiActionProposalDelta(
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      deadline,
      userAddress
    );
  } else {
    return createMultiActionProposalGamma(
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      deadline
    );
  }
}

export function createCustomProposal(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  deadline,
  userAddress,
  version
) {
  if (version > 3) {
    return createCustomProposalDelta(
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      deadline,
      userAddress
    );
  } else {
    return createCustomProposalGamma(
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      deadline
    );
  }
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
  if (version > 3) {
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
  title,
  description,
  value,
  userAddress,
  version
) {
  if (version > 3) {
    return createFudSuggestionDelta(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress
    );
  } else {
    return createFudSuggestionGamma(
      poolAddress,
      tokenAddress,
      title,
      description,
      value
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
  if (version > 3) {
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
  tokenOut,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 3) {
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
  buyerAddress,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 3) {
    return createNftBuyProposalDelta(
      poolAddress,
      nftAddress,
      tokenId,
      buyerAddress,
      title,
      description,
      amount,
      userAddress
    );
  } else {
    return createNftBuyProposalGamma(
      poolAddress,
      nftAddress,
      tokenId,
      buyerAddress,
      title,
      description,
      amount
    );
  }
}

export async function createNftSellProposal(
  poolAddress,
  nftAddress,
  tokenId,
  sellerAddress,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 3) {
    return createNftSellProposalDelta(
      poolAddress,
      nftAddress,
      tokenId,
      sellerAddress,
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
      sellerAddress,
      title,
      description,
      amount
    );
  }
}

export function executeProposal(poolAddress, id, version) {
  if (version > 3) {
    return executeProposalDelta(poolAddress, id);
  } else {
    return executeProposalGamma(poolAddress, id);
  }
}
