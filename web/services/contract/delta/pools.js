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
import { httpProvider } from '../provider';

export function fetchUserPoolsDelta(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherDelta();
    const poolAddresses = await poolLauncher.poolsOfMember(userAddress);

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolDelta(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'DELTA', number: 4 },
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
      userAddress: userAddress,
    });
    const tx = await usdcContract.populateTransaction.approve(
      poolAddress,
      usdc(value),
      {
        gasPrice: await gasPrice(),
      }
    );

    smartContractTransaction(tx)
      .then((transaction) => {
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
      })
      .catch((err) => {
        reject(err);
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

export function normalTransactionsDelta(poolAddress) {
  return new Promise(async (resolve, reject) => {
    console.log('imNormalTrans');

    console.log(poolAddress);

    axios({
      url: `https://api.polygonscan.com/api?module=account&action=txlist&address=0xF0D1a6081Fa87aFBB1854586284890be205076f9&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${process.env.POLYGONSCAN_API_KEY}`,
    })
      .then((res) => {
        console.log(res.data);
        resolve(res.data);
      })
      .catch((err) => {
        console.log('eerrrrror');
        reject(err);
      });
  });
}
