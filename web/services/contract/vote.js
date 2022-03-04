import {ethers} from 'ethers';
import useWunderPass from '/hooks/useWunderPass';

export async function vote(poolAddress, proposalId, mode) {
  return new Promise((resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const address = poolAddress;
    const abi = ["function vote(uint proposalId, uint mode) public"]
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/TmNYkrTbVUgUS0rjsxLLMmav2iD5AJod");
    const wunderPool = new ethers.Contract(address, abi, provider);
    
    smartContractTransaction(false).then(async (privKey) => {
      try {
        const gasPrice = await provider.getGasPrice();
        const wallet = new ethers.Wallet(privKey, provider);
        const resp = await wunderPool.connect(wallet).vote(proposalId, mode, {gasPrice: gasPrice.mul(5).div(4)});
        resolve(resp)
      } catch (error) {
        reject(error?.error?.error?.error?.message || error)
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


