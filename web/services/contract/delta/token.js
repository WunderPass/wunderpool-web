import { ethers } from 'ethers';
import { fetchPoolMembers } from '/services/contract/pools';
import { initPoolDelta } from '/services/contract/delta/init';
import { nftAbi, tokenAbi } from '/services/contract/init';

export function fetchPoolNftsDelta(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolDelta(address);
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

export function fetchPoolGovernanceTokenDelta(address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool, provider] = initPoolDelta(address);
    const govTokenAddress = await wunderPool.governanceToken();
    const govToken = new ethers.Contract(govTokenAddress, tokenAbi, provider);
    const totalSupply = await govToken.totalSupply();
    fetchPoolMembers(address).then(async (memberAddresses) => {
      const holders = await Promise.all(
        memberAddresses.map(async (addr) => {
          const tokens = await govToken.balanceOf(addr);
          return {
            address: addr,
            tokens: tokens,
            share: tokens.mul(100).div(totalSupply),
          };
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
