import { SupportedChain } from './types';
import { ethers, BigNumber } from 'ethers';
import { fetchPoolTokensGamma } from './gamma/token';
import { gasPrice, tokenAbi, usdcAddress } from './init';
import { httpProvider } from './provider';
import { toEthString } from '../../services/formatter';
import axios from 'axios';
import { cacheItemDB, getCachedItemDB } from '../caching';
import useWeb3 from '../../hooks/useWeb3';

export async function fetchErc20TokenData(
  address: string,
  options: { ownerAddress?: string; chain?: SupportedChain } = {}
) {
  const { ownerAddress = null, chain = 'polygon' } = options;
  const token = new ethers.Contract(address, tokenAbi, httpProvider(chain));
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

export function fetchPoolTokens(address: string, version) {
  return fetchPoolTokensGamma(address);
}

export async function tokenBalanceOf(
  address: string,
  tokenAddress: string,
  decimals = null,
  chain: SupportedChain
) {
  const token = new ethers.Contract(
    tokenAddress,
    tokenAbi,
    httpProvider(chain)
  );
  try {
    const balance = await token.balanceOf(address);
    if (decimals) {
      return toEthString(balance, decimals);
    } else {
      const dec = await token.decimals();
      return toEthString(balance, dec);
    }
  } catch (error) {
    return '0';
  }
}

export async function usdcBalanceOf(address: string, chain: SupportedChain) {
  return Number(await tokenBalanceOf(address, usdcAddress(chain), 6, chain));
}

export function approve(
  user: string,
  spender: string,
  amount: number,
  tokenAddress: string,
  chain: SupportedChain
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = openPopup('smartContract');
    const provider = httpProvider(chain);
    try {
      const token = new ethers.Contract(
        tokenAddress,
        ['function increaseAllowance(address,uint)'],
        provider
      );
      const populatedTx = await token.populateTransaction.increaseAllowance(
        spender,
        amount,
        {
          gasPrice: await gasPrice(chain),
          from: user,
        }
      );

      const approveTx = await smartContractTransaction(
        populatedTx,
        null,
        chain,
        popup
      );
      const receipt = await provider.waitForTransaction(approveTx.hash);
      resolve(receipt);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
}

export async function approveUSDC(
  user: string,
  spender: string,
  amount: number | BigNumber,
  chain: SupportedChain
): Promise<string | undefined> {
  const provider = httpProvider(chain);

  const { openPopup, smartContractTransaction } = useWeb3();
  const popup = openPopup('smartContract');

  try {
    const transaction = await smartContractTransaction(
      null,
      { amount, spender },
      chain,
      popup
    );
    if (transaction.hash) {
      try {
        await provider.waitForTransaction(transaction.hash);
        return transaction.hash;
      } catch (error) {
        throw error?.error?.error?.error?.message || error;
      }
    } else {
      return undefined;
    }
  } catch (error) {
    throw error;
  }
}

export async function transferToken(
  user: string,
  tokenAddress: string,
  receiver: string,
  amount: number | BigNumber,
  chain: SupportedChain
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const { openPopup, smartContractTransaction } = useWeb3();
      const popup = openPopup('smartContract');
      const provider = httpProvider(chain);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        provider
      );
      const populatedTx = await tokenContract.populateTransaction.transfer(
        receiver,
        amount,
        { gasPrice: await gasPrice(chain), from: user }
      );

      const approveTx = await smartContractTransaction(
        populatedTx,
        null,
        chain,
        popup
      );
      resolve(approveTx.hash);
    } catch (error) {
      reject(error?.error?.error?.error?.message || error);
    }
  });
}

export async function transferUsdc(
  user: string,
  receiver: string,
  usdcAmount: number,
  chain: SupportedChain
) {
  return transferToken(
    user,
    usdcAddress(chain),
    receiver,
    usdcAmount * 1000000,
    chain
  );
}
