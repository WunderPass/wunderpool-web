import { TransactionData } from './../types';
import { encodeParams, usdc } from '../../../services/formatter';
import { initPoolDelta, initProposalDelta } from './init';
import {
  gasPrice,
  usdcAddress,
  wunderSwapperAddress,
  connectContract,
} from '../../../services/contract/init';
import { hasVotedDelta } from './vote';
import useWeb3 from '../../../hooks/useWeb3';
import { BigNumber } from 'ethers';

function determineExecutable(
  executed,
  yesVotes,
  noVotes,
  totalVotes,
  deadline
) {
  if (executed) return false;
  if (noVotes.mul(2).gte(totalVotes)) return false;
  return (
    deadline.mul(1000).lt(Number(new Date())) || yesVotes.mul(2).gte(totalVotes)
  );
}

export async function fetchPoolProposalsDelta(
  address: string,
  userAddress = null
) {
  try {
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

        const executable = determineExecutable(
          executed,
          yesVotes,
          noVotes,
          totalVotes,
          deadline
        );
        const declined = noVotes.mul(2).gte(totalVotes);
        const hasVoted = userAddress
          ? await hasVotedDelta(address, id, userAddress)
          : null;

        return {
          id: id.toNumber(),
          title,
          description,
          transactionCount,
          deadline: deadline.mul(1000).toNumber(),
          yesVotes: yesVotes.toNumber(),
          noVotes: noVotes.toNumber(),
          totalVotes: totalVotes.toNumber(),
          createdAt: createdAt.mul(1000).toNumber(),
          executed,
          executable,
          declined,
          hasVoted,
        };
      })
    );
    return proposals;
  } catch (error) {
    throw error;
  }
}

export function fetchTransactionDataDelta(
  address,
  id,
  transactionCount
): Promise<TransactionData[]> {
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
  poolAddress: string,
  title: string,
  description: string,
  contractAddresses: string[],
  actions: string[],
  params: string[],
  transactionValues: number[],
  deadline: number,
  userAddress: string,
  popupWindow?: Window | (() => void)
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWeb3();
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
        const tx = await connectContract(
          wunderPool,
          'polygon'
        ).createProposalForUser(
          userAddress,
          title,
          description,
          contractAddresses,
          actions,
          params,
          transactionValues,
          deadline,
          signature.signature,
          { gasPrice: await gasPrice('polygon') }
        );

        const result = await tx.wait();
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createApeSuggestionDelta(
  poolAddress: string,
  tokenAddress: string,
  title: string,
  description: string,
  value: number,
  userAddress: string
) {
  return createSwapSuggestionDelta(
    poolAddress,
    usdcAddress('polygon'),
    tokenAddress,
    title,
    description,
    usdc(value),
    userAddress
  );
}

export function createFudSuggestionDelta(
  poolAddress: string,
  tokenAddress: string,
  title: string,
  description: string,
  value: number | BigNumber,
  userAddress: string
) {
  return createSwapSuggestionDelta(
    poolAddress,
    tokenAddress,
    usdcAddress('polygon'),
    title,
    description,
    value,
    userAddress
  );
}

export function createLiquidateSuggestionDelta(
  poolAddress: string,
  title: string,
  description: string,
  userAddress: string
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
  poolAddress: string,
  tokenIn: string,
  tokenOut: string,
  title: string,
  description: string,
  amount: number | BigNumber,
  userAddress: string
) {
  const { openPopup } = useWeb3();
  const popup = openPopup('sign');
  const [wunderPool] = initPoolDelta(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposalDelta(
      poolAddress,
      title,
      description,
      [tokenIn, wunderSwapperAddress('polygon')],
      ['transfer(address,uint256)', 'swapTokens(address,address,uint256)'],
      [
        encodeParams(
          ['address', 'uint256'],
          [wunderSwapperAddress('polygon'), amount]
        ),
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
      [tokenIn, wunderSwapperAddress('polygon'), poolAddress],
      [
        'transfer(address,uint256)',
        'swapTokens(address,address,uint256)',
        'addToken(address,bool,uint256)',
      ],
      [
        encodeParams(
          ['address', 'uint256'],
          [wunderSwapperAddress('polygon'), amount]
        ),
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
  poolAddress: string,
  nftAddress: string,
  tokenId: number,
  title: string,
  description: string,
  amount: number,
  userAddress: string
) {
  return createMultiActionProposalDelta(
    poolAddress,
    title,
    description,
    [usdcAddress('polygon'), nftAddress],
    [
      'transferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
    ],
    [
      encodeParams(
        ['address', 'address', 'uint256'],
        [userAddress, poolAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, userAddress, tokenId]
      ),
    ],
    [0, 0],
    1846183041,
    userAddress
  );
}

export async function createNftSellProposalDelta(
  poolAddress: string,
  nftAddress: string,
  tokenId: number,
  title: string,
  description: string,
  amount: number,
  userAddress: string
) {
  return createMultiActionProposalDelta(
    poolAddress,
    title,
    description,
    [usdcAddress('polygon'), nftAddress],
    [
      'transferFrom(address,address,uint256)',
      'transferFrom(address,address,uint256)',
    ],
    [
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, userAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [userAddress, poolAddress, tokenId]
      ),
    ],
    [0, 0],
    1846183041,
    userAddress
  );
}

export function proposalExecutableDelta(poolAddress: string, id: number) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalDelta();

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalDelta(
  poolAddress: string,
  id: number
): Promise<boolean> {
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
