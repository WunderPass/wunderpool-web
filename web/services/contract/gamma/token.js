import axios from 'axios';
import { ethers } from 'ethers';
import { toEthString } from '/services/formatter';
import { fetchPoolMembers } from '/services/contract/pools';
import { initPoolGamma } from '/services/contract/gamma/init';
import { nftAbi, tokenAbi } from '/services/contract/init';
import { cacheItemDB } from '../../caching';

export function fetchPoolTokensGamma(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolGamma(address);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

    const tokens = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const token = new ethers.Contract(addr, tokenAbi, provider);
        const balance = await token.balanceOf(address);
        const decimals = await token.decimals();
        const formattedBalance = toEthString(balance, decimals);
        const apiResponse = await cacheItemDB(
          addr,
          (
            await axios({
              url: `/api/tokens/show`,
              params: { address: addr },
            })
          ).data,
          600
        );

        let {
          name,
          symbol,
          price = 0,
          image_url,
          dollar_price = 0,
          tradable = false,
        } = apiResponse;

        name = name || (await token.name());
        symbol = symbol || (await token.symbol());

        const usdValue = balance
          .mul(price)
          .div(10000)
          .div(ethers.BigNumber.from(10).pow(decimals))
          .toNumber();

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
          verified: Boolean(apiResponse),
          tradable,
        };
      })
    );
    resolve(tokens);
  });
}

export function fetchPoolNftsGamma(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolGamma(address);
    const tokenAddresses = await wunderPool.getOwnedNftAddresses();

    const nfts = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const nft = new ethers.Contract(addr, nftAbi, provider);
        const tokenIds = await wunderPool.getOwnedNftTokenIds(addr);
        const tokens = await Promise.all(
          tokenIds.map(async (id) => {
            return { id: id, uri: await nft?.tokenURI(id) };
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
  });
}

export function fetchPoolGovernanceTokenGamma(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolGamma(address);
    const govTokenAddress = await wunderPool.governanceToken();
    const govToken = new ethers.Contract(govTokenAddress, tokenAbi, provider);
    const totalSupply = await govToken.totalSupply();
    fetchPoolMembers(address).then(async (memberAddresses) => {
      const holders = await Promise.all(
        memberAddresses.map(async (addr) => {
          try {
            const tokens = await govToken.balanceOf(addr);
            return {
              address: addr,
              tokens: tokens,
              share: tokens.mul(100).div(totalSupply),
            };
          } catch (err) {
            return null;
          }
        })
      );
      resolve({
        address: govTokenAddress,
        name: await govToken.name(),
        symbol: await govToken.symbol(),
        price: await govToken.price(),
        minInvest: await wunderPool.entryBarrier(),
        totalSupply: totalSupply,
        holders: holders,
      });
    });
  });
}
