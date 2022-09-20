import { encodeParams } from '/services/formatter';
import { initProposalZeta } from './init';
import { usdcAddress } from '/services/contract/init';

export function fetchTransactionDataZeta(address, id, transactionCount) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalZeta();
    const transactions = await Promise.all(
      [...Array(transactionCount).keys()].map(async (index) => {
        try {
          const { action, param, transactionValue, contractAddress } =
            await wunderProposal.getProposalTransaction(address, id, index);
          return { action, params: param, transactionValue, contractAddress };
        } catch (error) {
          return null;
        }
      })
    );
    resolve(transactions);
  });
}

export async function createNftBuyProposalZeta(
  poolAddress,
  nftAddress,
  tokenId,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalZeta(
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
        [userAddress, poolAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [poolAddress, userAddress, tokenId]
      ),
    ],
    [0, 0],
    userAddress
  );
}

export async function createNftSellProposalZeta(
  poolAddress,
  nftAddress,
  tokenId,
  title,
  description,
  amount,
  userAddress
) {
  return createMultiActionProposalZeta(
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
        [poolAddress, userAddress, amount]
      ),
      encodeParams(
        ['address', 'address', 'uint256'],
        [userAddress, poolAddress, tokenId]
      ),
    ],
    [0, 0],
    userAddress
  );
}

export function proposalExecutableZeta(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalZeta(poolAddress);

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalZeta(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderProposal] = initProposalZeta();
      const { transactionCount } = await wunderProposal.getProposal(
        poolAddress,
        id
      );
      const transactions = await fetchTransactionDataZeta(
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
