import { TransactionData } from '../types';
import { initProposalEpsilon } from './init';

export function fetchTransactionDataEpsilon(
  address: string,
  id: number,
  transactionCount: number
): Promise<TransactionData[]> {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon();
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

export function proposalExecutableEpsilon(poolAddress: string, id: number) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon();

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalEpsilon(
  poolAddress: string,
  id: number
): Promise<boolean> {
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
