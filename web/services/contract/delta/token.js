import { ethers } from 'ethers';
import { initPoolDelta } from '/services/contract/delta/init';
import { nftAbi } from '/services/contract/init';

export function fetchPoolNftsDelta(address) {
  return new Promise(async (resolve, reject) => {
    try {
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
    } catch (error) {
      reject(error);
    }
  });
}
