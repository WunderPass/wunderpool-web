import { fetchPoolTokens } from '/services/contract/token';
import { useEffect, useState } from 'react';

export default function getPoolsInfo(pools) {
  const [nameBalanceArray, setNameBalanceArray] = useState([]);
  const [isReady, setIsReady] = useState();

  const getTotalBalances = async () => {
    const totalBalancesArray = await Promise.all(
      pools.map(async (pool, i) => {
        const poolTokens = await fetchPoolTokens(
          pool.address,
          pool.version.number
        );

        const totalBalances = poolTokens.map((token, i) => {
          var usdValueAsNumber = token.usdValue;
          return usdValueAsNumber;
        });

        const totalBalance = totalBalances.reduce((a, b) => a + b);
        return [totalBalance, pool.name];
      })
    );
    setNameBalanceArray(totalBalancesArray);
  };

  const initialize = async () => {
    await getTotalBalances();
  };

  useEffect(() => {
    setIsReady(false);
    if (pools.length == 0) return;
    initialize().then(() => {
      setIsReady(true);
    });
  }, [pools]);

  return [nameBalanceArray, isReady];
}
