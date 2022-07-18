import { ethers } from 'ethers';
import { encodeParams, usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { initPoolEpsilon, initProposalEpsilon } from './init';
import {
  gasPrice,
  usdcAddress,
  wunderSwapperAddress,
  connectContract,
} from '/services/contract/init';

export function fetchPoolProposalsEpsilon(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolEpsilon(address);
    const [wunderProposal] = initProposalEpsilon();
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
          creator,
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
          creator,
        };
      })
    );
    resolve(proposals);
  });
}

export function fetchTransactionDataEpsilon(address, id, transactionCount) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon();
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

export function createMultiActionProposalEpsilon(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  userAddress
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress,
    });
    const popup = openPopup('sign');
    const [wunderPool] = initPoolEpsilon(poolAddress);
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

export function createCustomProposalEpsilon(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
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
  return createMultiActionProposalEpsilon(
    poolAddress,
    title,
    description,
    contractAddresses,
    actions,
    encodedParams,
    formattedValues,
    userAddress
  );
}

export function createApeSuggestionEpsilon(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress
) {
  return createSwapSuggestionEpsilon(
    poolAddress,
    usdcAddress,
    tokenAddress,
    title,
    description,
    usdc(value),
    userAddress
  );
}

export function createFudSuggestionEpsilon(
  poolAddress,
  tokenAddress,
  title,
  description,
  value,
  userAddress
) {
  return createSwapSuggestionEpsilon(
    poolAddress,
    tokenAddress,
    usdcAddress,
    title,
    description,
    value,
    userAddress
  );
}

export function createLiquidateSuggestionEpsilon(
  poolAddress,
  title,
  description,
  userAddress
) {
  return createMultiActionProposalEpsilon(
    poolAddress,
    title,
    description,
    [poolAddress],
    ['liquidatePool()'],
    ['0x'],
    [0],
    userAddress
  );
}

export async function createSwapSuggestionEpsilon(
  poolAddress,
  tokenIn,
  tokenOut,
  title,
  description,
  amount,
  userAddress
) {
  const [wunderPool] = initPoolEpsilon(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposalEpsilon(
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
      userAddress
    );
  } else {
    return createMultiActionProposalEpsilon(
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
      userAddress
    );
  }
}

export async function createNftBuyProposalEpsilon(
  poolAddress,
  nftAddress,
  tokenId,
  buyerAddress,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalEpsilon(
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
    userAddress
  );
}

export async function createNftSellProposalEpsilon(
  poolAddress,
  nftAddress,
  tokenId,
  sellerAddress,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalEpsilon(
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
    userAddress
  );
}

export function proposalExecutableEpsilon(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon(poolAddress);

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalEpsilon(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderProposal] = initProposalEpsilon();
      const { transactionCount } = await wunderProposal.getProposal(
        poolAddress,
        id
      );
      const transactions = await fetchTransactionDataEpsilon(
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

export async function createJoinProposalEpsilon(
  poolAddress,
  userAddress,
  amount,
  govTokens
) {}
