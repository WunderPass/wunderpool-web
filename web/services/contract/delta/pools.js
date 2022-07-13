import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import axios from 'axios';
import {
  tokenAbi,
  usdcAddress,
  connectContract,
  gasPrice,
} from '/services/contract/init';
import { ethers } from 'ethers';
import { initLauncherDelta, initPoolDelta } from './init';
import { httpProvider, waitForTransaction } from '../provider';
import { approve } from '../token';

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
    approve(usdcAddress, userAddress, poolAddress, usdc(value))
      .then(async () => {
        const body = {
          poolAddress: poolAddress,
          userAddress: userAddress,
          amount: value,
          secret: secret,
        };

        axios({ method: 'POST', url: '/api/proxy/pools/join', data: body })
          .then((res) => {
            waitForTransaction(res.data)
              .then((tx) => {
                if (tx.status === 0) {
                  reject('Could not Join');
                } else {
                  resolve(tx);
                }
              })
              .catch((err) => {
                reject(err);
              });
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
    const { sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress,
    });
    const types = ['address', 'address', 'address'];
    const values = [userAddress, poolAddress, newMember];

    sendSignatureRequest(types, values)
      .then(async (signature) => {
        const [wunderPool] = initPoolDelta(poolAddress);
        const tx = await connectContract(wunderPool).addToWhiteListForUser(
          userAddress,
          newMember,
          signature.signature,
          { gasPrice: await gasPrice() }
        );

        const result = await tx.wait();
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function fundPoolDelta(poolAddress, amount) {
  return new Promise(async (resolve, reject) => {
    const { smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const [wunderPool, provider] = initPoolDelta(poolAddress);
    const tx = await wunderPool.populateTransaction.fundPool(usdc(amount), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, {
      amount: usdc(amount),
      spender: poolAddress,
    })
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
