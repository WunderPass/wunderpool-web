import { TransactionData } from './../types';
import { initProposalZeta } from './init';

export function fetchTransactionDataZeta(
  address,
  id,
  transactionCount
): Promise<TransactionData[]> {
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

export function proposalExecutableZeta(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalZeta();

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalZeta(poolAddress, id): Promise<boolean> {
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
