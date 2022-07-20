import { ethers } from 'ethers';
import { encodeParams, usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { initPoolDelta, initProposalDelta } from './init';
import {
  gasPrice,
  usdcAddress,
  wunderSwapperAddress,
  connectContract,
} from '/services/contract/init';

export function fetchPoolProposalsDelta(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolDelta(address);
    const [wunderProposal] = initProposalDelta();
    const proposalIds = await wunderPool.getAllProposalIds();
    const proposals = await Promise.all(
      proposalIds.map(async (id) => {
        const {
          title,
          description,
          transactionCount,
          deadline,
          yesVotes,
          noVotes,
          totalVotes,
          createdAt,
          executed,
        } = await wunderProposal.getProposal(address, id);
        return {
          id: id,
          title,
          description,
          transactionCount,
          deadline,
          yesVotes,
          noVotes,
          totalVotes,
          createdAt,
          executed,
        };
      })
    );
    resolve(proposals);
  });
}

export function fetchTransactionDataDelta(address, id, transactionCount) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalDelta();
    const transactions = await Promise.all(
      [...Array(transactionCount).keys()].map(async (index) => {
        const { action, param, transactionValue, contractAddress } =
          await wunderProposal.getProposalTransaction(address, id, index);
        return { action, params: param, transactionValue, contractAddress };
      })
    );
    resolve(transactions);
  });
}

export function createMultiActionProposalDelta(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  deadline,
  userAddress,
  popupWindow = null
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
      userAddress,
    });
    const popup = popupWindow || openPopup('sign');
    const [wunderPool] = initPoolDelta(poolAddress);
    const proposalId = (await wunderPool.getAllProposalIds()).length;
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
      'uint',
    ];
    const values = [
      userAddress,
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      deadline,
      proposalId,
    ];
    sendSignatureRequest(types, values, false, popup)
      .then(async (signature) => {
        const tx = await connectContract(wunderPool).createProposalForUser(
          userAddress,
          title,
          description,
          contractAddresses,
          actions,
          params,
          transactionValues,
          deadline,
          signature.signature,
          { gasPrice: await gasPrice() }
        );

        const result = await tx.wait();
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createCustomProposalDelta(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  deadline,
  userAddress
) {
  const formattedValues = transactionValues.map((val) =>
    ethers.utils.parseEther(String(val))
  );
  const encodedParams = params.map((param) =>
    encodeParams(
      param[0],
      param[1].map((par) => {
        try {
          return JSON.parse(par);
        } catch {
          return par;
        }
      })
    )
  );
  return createMultiActionProposalDelta(
    poolAddress,
    title,
    description,
    contractAddresses,
    actions,
    encodedParams,
    formattedValues,
    deadline,
    userAddress
  );
}

export function createApeSuggestionDelta(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress
) {
  return createSwapSuggestionDelta(
    poolAddress,
    usdcAddress,
    tokenAddress,
    title,
    description,
    usdc(value),
    userAddress
  );
}

export function createFudSuggestionDelta(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress
) {
  return createSwapSuggestionDelta(
    poolAddress,
    tokenAddress,
    usdcAddress,
    title,
    description,
    value,
    userAddress
  );
}

export function createLiquidateSuggestionDelta(
  poolAddress,
  title,
  description,
  userAddress
) {
  return createMultiActionProposalDelta(
    poolAddress,
    title,
    description,
    [poolAddress],
    ['liquidatePool()'],
    ['0x'],
    [0],
    1846183041,
    userAddress
  );
}

export async function createSwapSuggestionDelta(
  poolAddress,
  tokenIn,
  tokenOut,
  title,
  description,
  amount,
  userAddress
) {
  const { openPopup } = useWunderPass({
    name: 'Casama',
    accountId: 'ABCDEF',
    userAddress,
  });
  const popup = openPopup('sign');
  const [wunderPool] = initPoolDelta(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposalDelta(
      poolAddress,
      title,
      description,
      [tokenIn, wunderSwapperAddress],
      ['transfer(address,uint256)', 'swapTokens(address,address,uint256)'],
      [
        encodeParams(['address', 'uint256'], [wunderSwapperAddress, amount]),
        encodeParams(
          ['address', 'address', 'uint256'],
          [tokenIn, tokenOut, amount]
        ),
      ],
      [0, 0],
      1846183041,
      userAddress,
      popup
    );
  } else {
    return createMultiActionProposalDelta(
      poolAddress,
      title,
      description,
      [tokenIn, wunderSwapperAddress, poolAddress],
      [
        'transfer(address,uint256)',
        'swapTokens(address,address,uint256)',
        'addToken(address,bool,uint256)',
      ],
      [
        encodeParams(['address', 'uint256'], [wunderSwapperAddress, amount]),
        encodeParams(
          ['address', 'address', 'uint256'],
          [tokenIn, tokenOut, amount]
        ),
        encodeParams(['address', 'bool', 'uint256'], [tokenOut, false, 0]),
      ],
      [0, 0, 0],
      1846183041,
      userAddress,
      popup
    );
  }
}

export async function createNftBuyProposalDelta(
  poolAddress,
  nftAddress,
  tokenId,
  buyerAddress,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalDelta(
    poolAddress,
    title,
    description,
    [usdcAddress, nftAddress],
    [
      'transferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
    ],
    [
      encodeParams(
        ['address', 'address', 'uint256'],
        [buyerAddress, poolAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, buyerAddress, tokenId]
      ),
    ],
    [0, 0],
    1846183041,
    userAddress
  );
}

export async function createNftSellProposalDelta(
  poolAddress,
  nftAddress,
  tokenId,
  sellerAddress,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalDelta(
    poolAddress,
    title,
    description,
    [usdcAddress, nftAddress],
    [
      'transferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
    ],
    [
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, sellerAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [sellerAddress, poolAddress, tokenId]
      ),
    ],
    [0, 0],
    1846183041,
    userAddress
  );
}

export function proposalExecutableDelta(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalDelta(poolAddress);

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalDelta(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderProposal] = initProposalDelta();
      const { transactionCount } = await wunderProposal.getProposal(
        poolAddress,
        id
      );
      const transactions = await fetchTransactionDataDelta(
        poolAddress,
        id,
        transactionCount
      );
      if (
        transactions.find(
          (trx) =>
            trx.action == 'liquidatePool()' &&
            trx.contractAddress.toLowerCase() == poolAddress.toLowerCase()
        )
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
}
