import { ethers } from 'ethers';
import { initPool } from './init';
import useWunderPass from '/hooks/useWunderPass';

export function vote(poolAddress, proposalId, mode) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const [wunderPool, provider] = initPool(poolAddress);
    const gasPrice = await provider.getGasPrice();
    const tx = await wunderPool.populateTransaction.vote(proposalId, mode, {gasPrice: gasPrice.mul(5).div(4)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        console.log(transaction)
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function voteFor(address, proposalId) {
  return vote(address, proposalId, 1)
}

export function voteAgainst(address, proposalId) {
  return vote(address, proposalId, 2)
}

export function hasVoted(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    resolve(await wunderPool.hasVoted(proposalId, address));
  })
}