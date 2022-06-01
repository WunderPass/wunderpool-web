import { ethers } from 'ethers';
import { initPool, usdcAddress, tokenAbi, versionLookup } from './init';
import {
  fetchAllPoolsDelta,
  fetchPoolIsClosedDelta,
  fetchUserPoolsDelta,
  fundPoolDelta,
  joinPoolDelta,
} from './delta/pools';
import {
  fetchAllPoolsGamma,
  fetchUserPoolsGamma,
  fundPoolGamma,
  joinPoolGamma,
} from './gamma/pools';
import axios from 'axios';
import { httpProvider } from './provider';

export function poolVersion(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    resolve(versionLookup[await wunderPool.launcherAddress()]);
  });
}

export function createPool(
  poolName,
  entryBarrier,
  tokenName,
  tokenSymbol,
  tokenPrice,
  userAddress
) {
  return new Promise(async (resolve, reject) => {
    const body = {
      version: 'Delta',
      network: 'POLYGON_MAINNET',
      creator: userAddress,
      name: poolName,
      minInvest: entryBarrier,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      price: tokenPrice,
    };

    axios({ method: 'POST', url: '/api/proxy/pools/create', data: body })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function fetchUserPools(userAddress) {
  return new Promise(async (resolve, reject) => {
    const deltaPools = await fetchUserPoolsDelta(userAddress);
    const gammaPools = await fetchUserPoolsGamma(userAddress);
    resolve([...deltaPools, ...gammaPools]);
  });
}

export function fetchAllPools(version) {
  if (version > 3) {
    return fetchAllPoolsDelta();
  } else {
    return fetchAllPoolsGamma();
  }
}

export function joinPool(poolAddress, userAddress, value, version) {
  if (version > 3) {
    return joinPoolDelta(poolAddress, userAddress, value);
  } else {
    return joinPoolGamma(poolAddress, value);
  }
}

export function fetchPoolName(poolAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    wunderPool
      .name()
      .then((res) => resolve(res))
      .catch((err) => reject('Pool Not Found'));
  });
}

export function fetchPoolIsClosed(poolAddress, version) {
  if (version > 3) {
    return fetchPoolIsClosedDelta(poolAddress);
  } else {
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  }
}

export function fetchPoolMembers(poolAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    resolve(await wunderPool.poolMembers());
  });
}

export function isMember(poolAddress, userAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    resolve(await wunderPool.isMember(userAddress));
  });
}

export function fetchPoolBalance(poolAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    const provider = httpProvider;
    const usdcContract = new ethers.Contract(usdcAddress, tokenAbi, provider);
    resolve(await usdcContract.balanceOf(poolAddress));
  });
}

export function fundPool(poolAddress, amount, version) {
  if (version > 3) {
    return fundPoolDelta(poolAddress, amount);
  } else {
    return fundPoolGamma(poolAddress, amount);
  }
}
