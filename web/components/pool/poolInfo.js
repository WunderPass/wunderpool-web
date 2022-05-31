import { fetchPoolGovernanceToken } from '/services/contract/token';
import { fetchPoolTokens } from '/services/contract/token';
import { useEffect, useState } from 'react';

export default function getPoolInfo(_pool, _user) {
  const pool = _pool;
  const user = _user;
  const [governanceToken, setGovernanceToken] = useState(0);
  const [poolTokens, setPoolTokens] = useState();
  const [sharesOfUserInPercent, setSharesOfUserInPercent] = useState(0);
  const [isReady, setIsReady] = useState();

  const getInfo = async () => {
    const poolTokens = await fetchPoolTokens(pool.address, pool.version.number);

    console.log('poolTokens pre set: ' + poolTokens);
    console.log(poolTokens);
    setPoolTokens(poolTokens);
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
    await getInfo();
    await getSharesOfUser();
  };

  useEffect(() => {
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, []);

  return [governanceToken, poolTokens, sharesOfUserInPercent, isReady];
}
