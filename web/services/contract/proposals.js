import {
  createApeSuggestionDelta,
  createCustomProposalDelta,
  createFudSuggestionDelta,
  createLiquidateSuggestionDelta,
  createMultiActionProposalDelta,
  createNftBuyProposalDelta,
  createNftSellProposalDelta,
  createSwapSuggestionDelta,
  fetchPoolProposalsDelta,
  fetchTransactionDataDelta,
  isLiquidateProposalDelta,
} from './delta/proposals';
import {
  createApeSuggestionEpsilon,
  createCustomProposalEpsilon,
  createFudSuggestionEpsilon,
  createLiquidateSuggestionEpsilon,
  createMultiActionProposalEpsilon,
  createSwapSuggestionEpsilon,
  fetchPoolProposalsEpsilon,
  isLiquidateProposalEpsilon,
} from './epsilon/proposals';
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
  isLiquidateProposalGamma,
} from './gamma/proposals';

export function fetchPoolProposals(address, version) {
  if (version > 4) {
    return fetchPoolProposalsEpsilon(address);
  } else if (version > 3) {
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
  if (version > 4) {
    return createMultiActionProposalEpsilon(
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
  } else if (version > 3) {
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
  if (version > 4) {
    return createCustomProposalEpsilon(
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
  } else if (version > 3) {
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
  if (version > 4) {
    return createApeSuggestionEpsilon(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress
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
  title,
  description,
  value,
  userAddress,
  version
) {
  if (version > 4) {
    return createFudSuggestionEpsilon(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress
    );
  } else if (version > 3) {
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
  if (version > 4) {
    return createLiquidateSuggestionEpsilon(
      poolAddress,
      title,
      description,
      userAddress
    );
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
  tokenOut,
  title,
  description,
  amount,
  userAddress,
  version
) {
  if (version > 4) {
    return createSwapSuggestionEpsilon(
      poolAddress,
      tokenIn,
      tokenOut,
      title,
      description,
      amount,
      userAddress
    );
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

export function executeProposal(poolAddress, id, version = null) {
  return executeProposalGamma(poolAddress, id);
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
