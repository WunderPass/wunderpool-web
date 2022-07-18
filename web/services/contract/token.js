import { ethers } from 'ethers';
import useWunderPass from '/hooks/useWunderPass';
import {
  fetchPoolGovernanceTokenDelta,
  fetchPoolNftsDelta,
} from './delta/token';
import {
  fetchPoolGovernanceTokenGamma,
  fetchPoolNftsGamma,
  fetchPoolTokensGamma,
} from './gamma/token';
import { tokenAbi, usdcAddress } from './init';
import { httpProvider } from './provider';
import { toEthString } from '/services/formatter';
import { fetchPoolGovernanceTokenEpsilon } from './epsilon/token';

export function fetchERC20Data(address) {
  return new Promise(async (resolve, reject) => {
    const provider = httpProvider;
    const token = new ethers.Contract(address, tokenAbi, provider);
    resolve({ name: await token.name(), symbol: await token.symbol() });
  });
}

export function fetchPoolTokens(address, version) {
  return fetchPoolTokensGamma(address);
}

export function fetchPoolNfts(address, version) {
  if (version > 3) {
    return fetchPoolNftsDelta(address);
  } else {
    return fetchPoolNftsGamma(address);
  }
}

export function fetchPoolGovernanceToken(address, version) {
  if (version > 4) {
    return fetchPoolGovernanceTokenEpsilon(address);
  } else if (version > 3) {
    return fetchPoolGovernanceTokenDelta(address);
  } else {
    return fetchPoolGovernanceTokenGamma(address);
  }
}

export function tokenBalanceOf(address, tokenAddress, decimals = null) {
  return new Promise(async (resolve, reject) => {
    const token = new ethers.Contract(tokenAddress, tokenAbi, httpProvider);
    token
      .balanceOf(address)
      .then((balance) => {
        if (decimals) {
          resolve(toEthString(balance, decimals));
        } else {
          token
            .decimals()
            .then((dec) => {
              resolve(toEthString(balance, dec));
            })
            .catch((err) => {
              resolve(0);
            });
        }
      })
      .catch((err) => {
        resolve(0);
      });
  });
}

export async function usdcBalanceOf(address) {
  return await tokenBalanceOf(address, usdcAddress, 6);
}

export function approve(user, spender, amount) {
  return new Promise(async (resolve, reject) => {
    const provider = httpProvider;

    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress: user,
    });
    const popup = openPopup('smartContract');

    smartContractTransaction(null, { amount, spender }, 'polygon', popup)
      .then((transaction) => {
        if (transaction.hash) {
          provider
            .waitForTransaction(transaction.hash)
            .then(() => {
              console.log('DONE');
              resolve(transaction.hash);
            })
            .catch((error) => {
              reject(error?.error?.error?.error?.message || error);
            });
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}
