import { ethers } from 'ethers';
import useWunderPass from '/hooks/useWunderPass';
import { fetchPoolNftsDelta } from './delta/token';
import { fetchPoolNftsGamma, fetchPoolTokensGamma } from './gamma/token';
import { tokenAbi, usdcAddress } from './init';
import { httpProvider } from './provider';
import { toEthString } from '/services/formatter';
import axios from 'axios';
import { cacheItemDB, getCachedItemDB } from '../caching';
import useWeb3 from '../../hooks/useWeb3';

export async function fetchErc20TokenData(address, ownerAddress = null) {
  const token = new ethers.Contract(address, tokenAbi, httpProvider);
  const apiResponse =
    (await getCachedItemDB(address)) ||
    (await cacheItemDB(
      address,
      (
        await axios({
          url: `/api/tokens/show`,
          params: { address },
        })
      ).data,
      600
    ));
  let {
    name,
    symbol,
    decimals,
    price = 0,
    image_url,
    dollar_price = 0,
    tradable = false,
  } = apiResponse;

  name = name || (await token.name());
  symbol = symbol || (await token.symbol());
  decimals = decimals || (await token.decimals()).toNumber();

  if (ownerAddress) {
    const balance = await token.balanceOf(ownerAddress);
    const formattedBalance = toEthString(balance, decimals);

    const usdValue = balance
      .mul(price)
      .div(10000)
      .div(ethers.BigNumber.from(10).pow(decimals))
      .toNumber();

    return {
      name,
      symbol,
      decimals,
      price,
      image_url,
      dollar_price,
      tradable,
      balance,
      formattedBalance,
      usdValue,
    };
  } else {
    return { name, symbol, decimals, price, image_url, dollar_price, tradable };
  }
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

    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = openPopup('smartContract');

    smartContractTransaction(null, { amount, spender }, 'polygon', popup)
      .then((transaction) => {
        if (transaction.hash) {
          provider
            .waitForTransaction(transaction.hash)
            .then(() => {
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
