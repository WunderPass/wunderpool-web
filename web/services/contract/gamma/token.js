import { ethers } from 'ethers';
import { initPoolGamma } from '/services/contract/gamma/init';
import { nftAbi } from '/services/contract/init';
import { fetchErc20TokenData } from '../token';

export function fetchPoolTokensGamma(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolGamma(address);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

    const tokens = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const {
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
        } = await fetchErc20TokenData(addr, address);

        return {
          address: addr,
          name: name,
          symbol: symbol,
          balance: balance.toString(),
          decimals: decimals,
          formattedBalance: formattedBalance,
          image: image_url,
          price: price,
          dollarPrice: dollar_price,
          usdValue: usdValue / 100,
          verified: Boolean(dollar_price),
          tradable,
        };
      })
    );
    resolve(tokens);
  });
}

export function fetchPoolNftsGamma(address) {
  return new Promise(async (resolve, reject) => {
    try {
      const [wunderPool, provider] = initPoolGamma(address);
      const tokenAddresses = await wunderPool.getOwnedNftAddresses();

      const nfts = await Promise.all(
        tokenAddresses.map(async (addr) => {
          const nft = new ethers.Contract(addr, nftAbi, provider);
          const tokenIds = await wunderPool.getOwnedNftTokenIds(addr);
          const tokens = await Promise.all(
            tokenIds.map(async (id) => {
              return { id, uri: await nft?.tokenURI(id) };
            })
          );
          return {
            address: addr,
            name: await nft.name(),
            symbol: await nft.symbol(),
            tokens: tokens,
          };
        })
      );
      resolve(nfts);
    } catch (error) {
      reject(error);
    }
  });
}
