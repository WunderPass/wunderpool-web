import axios from 'axios';
import { ethers } from 'ethers';
import { currency, toEthString } from '/services/formatter';
import { fetchPoolMembers } from '/services/contract/pools';
import { initPoolEpsilon } from '/services/contract/epsilon/init';
import { nftAbi, tokenAbi } from '/services/contract/init';

export function fetchPoolTokensEpsilon(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolEpsilon(address);
    const tokenAddresses = await wunderPool.getOwnedTokenAddresses();

    const tokens = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const token = new ethers.Contract(addr, tokenAbi, provider);
        const balance = await token.balanceOf(address);
        const decimals = await token.decimals();
        const formattedBalance = toEthString(balance, decimals);
        const { name, symbol, price, image_url } = (
          await axios({ url: `/api/tokens/data`, params: { address: addr } })
        ).data;

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
          usdValue: usdValue / 100,
        };
      })
    );
    resolve(tokens);
  });
}

export function fetchPoolNftsEpsilon(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolEpsilon(address);
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

export function fetchPoolGovernanceTokenEpsilon(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolEpsilon(address);
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
        totalSupply: totalSupply,
        holders: holders,
      });
    });
  });
}
