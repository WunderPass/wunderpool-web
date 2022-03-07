import {ethers} from 'ethers';
import useWunderPass from '/hooks/useWunderPass';

export async function vote(poolAddress, proposalId, mode) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const address = poolAddress;
    const abi = ["function vote(uint proposalId, uint mode) public"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const wunderPool = new ethers.Contract(address, abi, provider);
    const gasPrice = await provider.getGasPrice();
    const tx = await wunderPool.populateTransaction.vote(proposalId, mode, {gasPrice: gasPrice.mul(5).div(4)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const resp = await provider.getTransaction(transaction.hash)
        const receipt = await resp.wait();
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
  return vote(address, proposalId, 0)
}

export function voteAbstain(address, proposalId) {
  return vote(address, proposalId, 2)
}


