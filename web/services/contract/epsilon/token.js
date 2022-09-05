import { BigNumber, ethers } from 'ethers';
import { fetchPoolMembersAndShares } from '/services/contract/pools';
import { initPoolEpsilon } from '/services/contract/epsilon/init';
import { nftAbi, tokenAbi } from '/services/contract/init';
import { initPoolConfigEpsilon } from './init';

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
    const [poolConfig] = initPoolConfigEpsilon();
    const govTokenAddress = await wunderPool.governanceToken();
    const govToken = new ethers.Contract(govTokenAddress, tokenAbi, provider);
    const totalSupply = await govToken.totalSupply();

    const holdersAndShares = await fetchPoolMembersAndShares(address);
    const holders = [];
    holdersAndShares.forEach(async (element) => {
      var object = {
        address: element.members_address,
        tokens: BigNumber.from(element.pool_shares_balance),
        share: BigNumber.from(element.pool_shares_balance)
          .mul(100)
          .div(totalSupply),
        invested: await wunderPool.investOfUser(element.members_address),
      };
      holders.push(object);
    });

    const {
      minInvest,
      maxInvest,
      maxMembers,
      votingThreshold,
      votingTime,
      minYesVoters,
    } = await poolConfig.getConfig(address);

    resolve({
      address: govTokenAddress,
      name: await govToken.name(),
      symbol: await govToken.symbol(),
      price: await govToken.price(),
      totalSupply: totalSupply,
      holders: holders,
      minInvest,
      maxInvest,
      maxMembers,
      votingThreshold,
      votingTime,
      minYesVoters,
    });
  });
}
