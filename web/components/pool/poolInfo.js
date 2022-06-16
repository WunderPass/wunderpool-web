import { fetchPoolGovernanceToken } from '/services/contract/token';
import { fetchPoolTokens } from '/services/contract/token';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function getPoolInfo(_pool, _user) {
  const pool = _pool;
  const user = _user;
  const [totalBalance, setTotalBalance] = useState();
  const [sharesOfUserInPercent, setSharesOfUserInPercent] = useState(0);
  const [members, setMembers] = useState([]);
  const [isReady, setIsReady] = useState();

  const getTotalBalance = async () => {
    const poolTokens = await fetchPoolTokens(pool.address, pool.version.number);
    const totalBalance = 0;

    poolTokens.map((token, i) => {
      var usdValueAsNumber = token.usdValue;
      totalBalance = totalBalance + usdValueAsNumber;
    });
    setTotalBalance(totalBalance);
  };

  const getSharesOfUser = async () => {
    const govTokens = await fetchPoolGovernanceToken(
      pool.address,
      pool.version.number
    );

    const resolvedMembers = await Promise.all(
      govTokens.holders.map(async (holder) => {
        if (
          holder.address.toString().toLowerCase() == user.address.toString()
        ) {
          setSharesOfUserInPercent(holder.share.toString());
        }
        try {
          const user = await axios({
            url: '/api/proxy/users/find',
            params: { address: holder.address },
          });
          return { ...holder, wunderId: user.data.wunderId };
        } catch {
          return holder;
        }
      })
    );
    setMembers(resolvedMembers);
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

  return [totalBalance, sharesOfUserInPercent, members, isReady];
}
