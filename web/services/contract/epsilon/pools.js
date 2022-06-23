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
import { initLauncherEpsilon, initPoolEpsilon } from './init';
import { httpProvider } from '../provider';

export function fetchWhitelistedUserPoolsEpsilon(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherEpsilon();
    const whiteListPools = await poolLauncher.whiteListedPoolsOfMember(
      userAddress
    );
    const memberPools = await poolLauncher.poolsOfMember(userAddress);

    const poolAddresses = whiteListPools.filter(
      (pool) => !memberPools.includes(pool)
    );

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolEpsilon(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'EPSILON', number: 5 },
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

export function joinPoolEpsilon(poolAddress, userAddress, value) {
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

export function addToWhiteListEpsilon(poolAddress, userAddress, newMember) {
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
        const [wunderPool] = initPoolEpsilon(poolAddress);
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

export function addToWhiteListWithSecretEpsilon(
  poolAddress,
  userAddress,
  secret,
  validFor
) {
  return new Promise(async (resolve, reject) => {
    const { sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress,
    });
    const hashedSecret = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secret)
    );
    const types = ['address', 'address', 'bytes32', 'uint256'];
    const values = [userAddress, poolAddress, hashedSecret, validFor];

    sendSignatureRequest(types, values)
      .then(async (signature) => {
        const [wunderPool] = initPoolEpsilon(poolAddress);
        const tx = await connectContract(wunderPool).addToWhiteListWithSecret(
          userAddress,
          hashedSecret,
          validFor,
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
