import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { gasPrice } from '/services/contract/init';
import { initLauncherGamma, initPoolGamma } from './init';

export function fetchUserPoolsGamma(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherGamma();
    const poolAddresses = await poolLauncher.poolsOfMember(userAddress);

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolGamma(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'GAMMA', number: 3 },
            isMember: true,
          };
        } catch (err) {
          return null;
        }
      })
    );
    resolve(pools.filter((elem) => elem));
  });
}

export function fetchAllPoolsGamma() {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherGamma();
    const poolAddresses = await poolLauncher.allPools();

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolGamma(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            entryBarrier: await wunderPool.entryBarrier(),
          };
        } catch (err) {
          return null;
        }
      })
    );
    resolve(pools.filter((elem) => elem));
  });
}

export function joinPoolGamma(poolAddress, value) {
  return new Promise(async (resolve, reject) => {
    const { smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.joinPool(usdc(value), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, {
      amount: usdc(value),
      spender: poolAddress,
    }).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    });
  });
}

export function fundPoolGamma(poolAddress, amount) {
  return new Promise(async (resolve, reject) => {
    const { smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.fundPool(usdc(amount), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, {
      amount: usdc(amount),
      spender: poolAddress,
    }).then(async (transaction) => {
      try {
        const receipt = await provider.waitForTransaction(transaction.hash);
        resolve(receipt);
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    });
  });
}
