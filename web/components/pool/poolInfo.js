import { fetchPoolGovernanceToken } from '/services/contract/token';
import { fetchPoolTokens } from '/services/contract/token';
import { useEffect, useState } from 'react';

export default function getPoolInfo(_pool, _user) {
  const pool = _pool;
  const user = _user;
  const [totalBalance, setTotalBalance] = useState();
  const [sharesOfUserInPercent, setSharesOfUserInPercent] = useState(0);
  const [isReady, setIsReady] = useState();

  const getTotalBalance = async () => {
    const poolTokens = await fetchPoolTokens(pool.address, pool.version.number);
    const totalBalance = 0;

    poolTokens.map((token, i) => {
      var usdValueAsNumber = Number(token.usdValue.replace(/[^0-9.-]+/g, ''));
      totalBalance = totalBalance + usdValueAsNumber;
    });
    setTotalBalance(totalBalance);
  };

  const getSharesOfUser = async () => {
    const govTokens = await fetchPoolGovernanceToken(
      pool.address,
      pool.version.number
    );
    govTokens.holders.map((holder, i) => {
      if (holder.address.toString().toLowerCase() == user.address.toString()) {
        setSharesOfUserInPercent(holder.share.toString());
      }
    });
  };

  const initialize = async () => {
    await getTotalBalance();
    await getSharesOfUser();
  };

  useEffect(() => {
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, []);

  return [totalBalance, sharesOfUserInPercent, isReady];
}
