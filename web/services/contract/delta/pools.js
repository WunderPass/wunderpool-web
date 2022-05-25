import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import axios from 'axios';
import { tokenAbi, usdcAddress } from '/services/contract/init';
import { ethers } from 'ethers';
import { initLauncherDelta, initPoolDelta } from './init';
import { gasPrice } from '../init';
import { httpProvider } from '../provider';

export function fetchUserPoolsDelta(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherDelta();
    const poolAddresses = await poolLauncher.whiteListedPoolsOfMember(
      userAddress
    );

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolDelta(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: 'DELTA',
            isMember: await wunderPool.isMember(userAddress),
          };
        } catch (err) {
          return null;
        }
      })
    );
    resolve(pools.filter((elem) => elem));
  });
}

export function fetchAllPoolsDelta() {
  return new Promise(async (resolve, reject) => {
    axios({ url: '/api/proxy/pools/all' })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function fetchPoolIsClosedDelta(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolDelta(poolAddress);
    wunderPool.poolClosed().then((res) => resolve(res));
  });
}

export function joinPoolDelta(poolAddress, userAddress, value) {
  return new Promise(async (resolve, reject) => {
    const body = {
      poolAddress: poolAddress,
      userAddress: userAddress,
      amount: value,
    };

    const provider = httpProvider;
    const usdcContract = new ethers.Contract(usdcAddress, tokenAbi, provider);

    const { smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const tx = await usdcContract.populateTransaction.approve(
      poolAddress,
      usdc(value),
      {
        gasPrice: await gasPrice(),
      }
    );

    smartContractTransaction(tx).then((transaction) => {
      provider
        .waitForTransaction(transaction.hash)
        .then(() => {
          axios({ method: 'POST', url: '/api/proxy/pools/join', data: body })
            .then((res) => {
              resolve(res.data);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((error) => {
          reject(error?.error?.error?.error?.message || error);
        });
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