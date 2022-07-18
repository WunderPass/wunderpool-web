import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { gasPrice } from '/services/contract/init';
import { initLauncherDelta, initPoolDelta } from './init';
import { approve } from '../token';
import { postAndWaitForTransaction } from '../../backendApi';

export function fetchWhitelistedUserPoolsDelta(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherDelta();
    const whiteListPools = await poolLauncher.whiteListedPoolsOfMember(
      userAddress
    );
    const memberPools = await poolLauncher.poolsOfMember(userAddress);

    const poolAddresses = whiteListPools.filter(
      (pool) => !memberPools.includes(pool)
    );

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolDelta(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'DELTA', number: 4 },
            isMember: false,
            closed: await wunderPool.poolClosed(),
          };
        } catch (err) {
          return null;
        }
      })
    );
    resolve(pools.filter((elem) => elem));
  });
}

export function fetchPoolIsClosedDelta(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolDelta(poolAddress);
    wunderPool.poolClosed().then((res) => resolve(res));
  });
}

export function joinPoolDelta(poolAddress, userAddress, value, secret) {
  return new Promise((resolve, reject) => {
    approve(userAddress, poolAddress, usdc(value))
      .then(async () => {
        const body = {
          poolAddress: poolAddress,
          userAddress: userAddress,
          amount: value,
          secret: secret,
        };

        postAndWaitForTransaction({ url: '/api/proxy/pools/join', body: body })
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((error) => {
        reject(error?.error?.error?.error?.message || error);
      });
  });
}

export function addToWhiteListDelta(poolAddress, userAddress, newMember) {
  return new Promise(async (resolve, reject) => {
    if (userAddress == newMember) {
      reject('You cant invite yourself');
      return;
    }
    const { openPopup, sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress,
    });
    const popup = openPopup('sign');
    const types = ['address', 'address', 'address'];
    const values = [userAddress, poolAddress, newMember];

    sendSignatureRequest(types, values, true, popup)
      .then(async (signature) => {
        const body = {
          poolAddress,
          userAddress,
          newMember,
          signature: signature.signature,
        };
        postAndWaitForTransaction({
          url: '/api/proxy/pools/whitelist',
          body: body,
        })
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function fundPoolDelta(poolAddress, amount) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress: user,
    });
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolDelta(poolAddress);
    const tx = await wunderPool.populateTransaction.fundPool(usdc(amount), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(
      tx,
      {
        amount: usdc(amount),
        spender: poolAddress,
      },
      'polygon',
      popup
    )
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
