import { ethers } from 'ethers';
import { encodeParams, usdc } from '/services/formatter';
import { initPoolGamma } from './init';
import {
  gasPrice,
  wunderSwapperAddress,
  usdcAddress,
} from '/services/contract/init';
import { tokenAbi } from '../init';
import { isLiquidateProposal } from '../proposals';
import { hasVotedGamma } from './vote';
import useWeb3 from '/hooks/useWeb3';

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

export function fetchPoolProposalsGamma(address, userAddress = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderPool] = initPoolGamma(address);
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
          } = await wunderPool.getProposal(id);

          const executable = determineExecutable(
            executed,
            yesVotes,
            noVotes,
            totalVotes,
            deadline
          );
          const declined = noVotes.mul(2).gte(totalVotes);

          const hasVoted = userAddress
            ? await hasVotedGamma(address, id, userAddress)
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
      resolve(proposals);
    } catch (error) {
      reject(error);
    }
  });
}

export function fetchTransactionDataGamma(address, id, transactionCount) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolGamma(address);
    const transactions = await Promise.all(
      [...Array(transactionCount).keys()].map(async (index) => {
        const { action, param, transactionValue, contractAddress } =
          await wunderPool.getProposalTransaction(id, index);
        return { action, params: param, transactionValue, contractAddress };
      })
    );
    resolve(transactions);
  });
}

export function createSingleActionProposalGamma(
  poolAddress,
  title,
  description,
  contractAddress,
  action,
  params,
  transactionValue,
  deadline
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.createProposal(
      title,
      description,
      contractAddress,
      action,
      params,
      transactionValue,
      deadline,
      { gasPrice: await gasPrice() }
    );

    smartContractTransaction(tx, null, 'polygon', popup)
      .then(async (transaction) => {
        try {
          const receipt = await provider.waitForTransaction(transaction.hash);
          resolve(receipt);
        } catch (error) {
          reject(error?.error?.error?.error?.message || error);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createMultiActionProposalGamma(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  deadline,
  popupWindow = null
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = popupWindow || openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.createMultiActionProposal(
      title,
      description,
      contractAddresses,
      actions,
      params,
      transactionValues,
      deadline,
      { gasPrice: await gasPrice() }
    );

    smartContractTransaction(tx, null, 'polygon', popup)
      .then(async (transaction) => {
        try {
          const receipt = await provider.waitForTransaction(transaction.hash);
          resolve(receipt);
        } catch (error) {
          reject(error?.error?.error?.error?.message || error);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function createApeSuggestionGamma(
  poolAddress,
  tokenAddress,
  title,
  description,
  value
) {
  return createSwapSuggestionGamma(
    poolAddress,
    usdcAddress,
    tokenAddress,
    title,
    description,
    usdc(value)
  );
}

export function createFudSuggestionGamma(
  poolAddress,
  tokenAddress,
  title,
  description,
  value
) {
  return createSwapSuggestionGamma(
    poolAddress,
    tokenAddress,
    usdcAddress,
    title,
    description,
    value
  );
}

export function createLiquidateSuggestionGamma(
  poolAddress,
  title,
  description
) {
  return createSingleActionProposalGamma(
    poolAddress,
    title,
    description,
    poolAddress,
    'liquidatePool()',
    '0x',
    0,
    1846183041
  );
}

export async function createSwapSuggestionGamma(
  poolAddress,
  tokenIn,
  tokenOut,
  title,
  description,
  amount
) {
  const { openPopup } = useWeb3();
  const popup = openPopup('smartContract');
  const [wunderPool] = initPoolGamma(poolAddress);
  const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

  if (tokenAddresses.includes(tokenOut)) {
    return createMultiActionProposalGamma(
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
      popup
    );
  } else {
    return createMultiActionProposalGamma(
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
      popup
    );
  }
}

export function proposalExecutableGamma(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const govTokenAddress = await wunderPool.governanceToken();
    const govToken = new ethers.Contract(govTokenAddress, tokenAbi, provider);
    const totalSupply = await govToken.totalSupply();

    try {
      const { deadline, yesVotes, noVotes, executed } =
        await wunderPool.getProposal(id);
      if (executed) resolve([false, 'Already Executed']);
      if (noVotes.mul(2).lte(totalSupply))
        resolve([false, 'Majority voted against execution']);
      if (yesVotes.mul(2).gt(totalSupply) || deadline.lte(Number(new Date())))
        resolve([false, 'Voting still allowed']);
      resolve([true, '']);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function executeProposalGamma(poolAddress, id, version) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.executeProposal(id, {
      gasPrice: await gasPrice(),
    });
    const isLiquidate = await isLiquidateProposal(poolAddress, id, version);

    smartContractTransaction(tx, null, 'polygon', popup)
      .then(async (transaction) => {
        try {
          await provider.waitForTransaction(transaction.hash);
          resolve(isLiquidate);
        } catch (error) {
          reject(error?.error?.error?.error?.message || error);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function isLiquidateProposalGamma(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderPool] = initPoolGamma(poolAddress);
      const { transactionCount } = await wunderPool.getProposal(id);
      const transactions = await fetchTransactionDataGamma(
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
