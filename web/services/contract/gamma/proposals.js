import { ethers } from 'ethers';
import { encodeParams, usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { initPoolGamma } from './init';
import {
  gasPrice,
  wunderSwapperAddress,
  usdcAddress,
} from '/services/contract/init';
import { tokenAbi } from '../init';

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

export function fetchPoolProposalsGamma(address) {
  return new Promise(async (resolve, reject) => {
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
          abstainVotes,
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

        return {
          id: id,
          title,
          description,
          transactionCount,
          deadline,
          yesVotes,
          noVotes,
          abstainVotes,
          totalVotes,
          createdAt,
          executed,
          executable,
          declined,
        };
      })
    );
    resolve(proposals);
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
    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
    });
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
    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
    });
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

export function createCustomProposalGamma(
  poolAddress,
  title,
  description,
  contractAddresses,
  actions,
  params,
  transactionValues,
  deadline
) {
  if (
    contractAddresses?.length > 1 &&
    actions?.length > 1 &&
    params?.length > 1 &&
    transactionValues?.length > 1
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
    return createMultiActionProposalGamma(
      poolAddress,
      title,
      description,
      contractAddresses,
      actions,
      encodedParams,
      formattedValues,
      deadline
    );
  } else if (
    contractAddresses?.length == 1 &&
    actions?.length == 1 &&
    params?.length == 1 &&
    transactionValues?.length == 1
  ) {
    const formattedValue = ethers.utils.parseEther(
      String(transactionValues[0] || 0)
    );
    const encodedParams = encodeParams(
      params[0][0],
      params[0][1].map((par) => {
        try {
          return JSON.parse(par);
        } catch {
          return par;
        }
      })
    );
    return createSingleActionProposalGamma(
      poolAddress,
      title,
      description,
      contractAddresses[0],
      actions[0],
      encodedParams,
      formattedValue,
      deadline
    );
  } else {
    return new Promise((resolve, reject) => reject('INVALID PROPOSAL'));
  }
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
  const { openPopup } = useWunderPass({
    name: 'Casama',
    accountId: 'ABCDEF',
  });
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

export async function createNftBuyProposalGamma(
  poolAddress,
  nftAddress,
  tokenId,
  buyerAddress,
  title,
  description,
  amount
) {
  return createMultiActionProposalGamma(
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
    1846183041
  );
}

export async function createNftSellProposalGamma(
  poolAddress,
  nftAddress,
  tokenId,
  sellerAddress,
  title,
  description,
  amount
) {
  return createMultiActionProposalGamma(
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
    1846183041
  );
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

export function executeProposalGamma(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
    });
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.executeProposal(id, {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, null, 'polygon', popup)
      .then(async (transaction) => {
        try {
          console.log(transaction.hash);
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
