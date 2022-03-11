import {ethers} from 'ethers';
import { matic } from '/services/formatter';
import { initLauncher, initPool } from './init';
import useWunderPass from '/hooks/useWunderPass';

export function createPool(poolName, entryBarrier, tokenName, tokenSymbol, value) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const [poolLauncher, provider] = initLauncher();
    const gasPrice = await provider.getGasPrice();
    const tx = await poolLauncher.populateTransaction.createNewPool(poolName, matic(entryBarrier), tokenName, tokenSymbol, {gasPrice: gasPrice.mul(5).div(4), value: matic(value)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function fetchUserPools(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncher();
    const poolAddresses = await poolLauncher.poolsOfMember(userAddress);

    const pools = await Promise.all(poolAddresses.map(async (addr) => {
      const [wunderPool] = initPool(addr);
      try {
        return {address: addr, name: await wunderPool.name()};
      } catch (err) {
        return null;
      }
    }))
    resolve(pools.filter((elem) => elem))
  })
}

export function fetchAllPools() {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncher();
    const poolAddresses = await poolLauncher.allPools();

    const pools = await Promise.all(poolAddresses.map(async (addr) => {
      const [wunderPool] = initPool(addr);
      try {
        return {address: addr, name: await wunderPool.name(), entryBarrier: await wunderPool.entryBarrier()};
      } catch (err) {
        return null;
      }
    }))
    resolve(pools.filter((elem) => elem))
  })
}

export function joinPool(poolAddress, value) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const [wunderPool, provider] = initPool(poolAddress);
    const gasPrice = await provider.getGasPrice();
    const tx = await wunderPool.populateTransaction.enterPool({gasPrice: gasPrice.mul(5).div(4), value: matic(value)});
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}

export function fetchPoolName(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    wunderPool.name().then(res => resolve(res)).catch((err) => reject('Pool Not Found'))
  })
}

export function fetchPoolMembers(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    resolve(await wunderPool.poolMembers())
  })
}

export function isMember(poolAddress, user) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    resolve(await wunderPool.isMember(user))
  })
}

export function fetchPoolBalance(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const provider = new ethers.providers.AlchemyProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
    resolve(await provider.getBalance(poolAddress))
  })
}

export function fundPool(poolAddress, amount) {
  return new Promise(async (resolve, reject) => {
    const {smartContractTransaction} = useWunderPass({name: 'WunderPool', accountId: 'ABCDEF'});
    const provider = new ethers.providers.AlchemyProvider("matic", "0MP-IDcE4civg4aispshnYoOKIMobN-A");
    const gasPrice = await provider.getGasPrice();
    const tx = {to: poolAddress, value: ethers.utils.parseEther(amount), gasPrice: gasPrice.mul(5).div(4)}
    
    smartContractTransaction(tx).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    })
  })
}
