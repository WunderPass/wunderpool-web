import { initLauncherZeta, initPoolZeta } from './init';

export function fetchWhitelistedUserPoolsZeta(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherZeta();
    const whiteListPools = await poolLauncher.whiteListedPoolsOfMember(
      userAddress
    );
    const memberPools = await poolLauncher.poolsOfMember(userAddress);

    const poolAddresses = whiteListPools.filter(
      (pool) => !memberPools.includes(pool)
    );

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolZeta(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'ZETA', number: 5 },
            isMember: false,
            closed: await wunderPool.poolClosed(),
          };
        } catch (err) {
          return null;
        }
      })
    );
    resolve(pools.filter((elem) => elem));
  });
}
