import { SupportedChain, TransactionData } from './../types';
import { initProposalEta } from './init';

export function fetchTransactionDataEta(
  address: string,
  id,
  transactionCount: number,
  chain: SupportedChain
): Promise<TransactionData[]> {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEta(chain);
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

export function proposalExecutableEta(poolAddress, id) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEta(poolAddress);

    try {
      const { executable, errorMessage } =
        await wunderProposal.proposalExecutable(poolAddress, id);
      resolve([executable, errorMessage]);
    } catch (error) {
      resolve([false, 'Proposal does not exist']);
    }
  });
}

export function isLiquidateProposalEta(
  poolAddress,
  id,
  chain: SupportedChain
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderProposal] = initProposalEta(chain);
      const { transactionCount } = await wunderProposal.getProposal(
        poolAddress,
        id
      );
      const transactions = await fetchTransactionDataEta(
        poolAddress,
        id,
        transactionCount,
        chain
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
