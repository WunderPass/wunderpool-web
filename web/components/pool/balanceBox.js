import { Typography, Skeleton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';

function BalanceBox(props) {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  const pools = user.pools;
  const topThree = pools
    .sort((a, b) => b.userBalance - a.userBalance)
    .slice(0, 3);
  const cashInPools = pools
    .map((p) => p.userBalance)
    .reduce((a, b) => a + b, 0);

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  useEffect(() => {
    if (user.usdBalance) {
      setTotalBalance(cashInPools);
    }
  }, [user.usdBalance, cashInPools]);

  useEffect(() => {
    if (user.isReady) {
      setLoading(false);
    }
  }, [user.isReady]);

  return !loading ? (
    <>
      <div className="sm:h-full sm:max-h-96 ">
        <div className="flex sm:h-full flex-col justify-between container-kaico mb-1 m:mr-8 w-full ">
          <Typography className="pb-6">Total Pool Balances</Typography>
          <Typography className="text-3xl ">
            {currency(totalBalance)}
          </Typography>

          {topThree.length > 0 && (
            <div className="flex flex-row items-center">
              <div className="h-3 w-3 mt-3 bg-red-500 rounded-sm mr-2" />
              <Typography className="pt-5 py-2 truncate">
                {currency(topThree[0]?.userBalance)} {topThree[0]?.name}
              </Typography>
            </div>
          )}

          {topThree.length > 1 && (
            <div className="flex flex-row items-center">
              <div className="h-3 w-3 mt-3 bg-yellow-200 rounded-sm mr-2" />
              <Typography className="pt-5 py-2 truncate">
                {currency(topThree[1]?.userBalance)} {topThree[1]?.name}
              </Typography>
            </div>
          )}

          {topThree.length > 2 && (
            <div className="flex flex-row items-center">
              <div className="h-3 w-3 mt-3 bg-pink-300 rounded-sm mr-2" />
              <Typography className="pt-5 py-2 truncate">
                {currency(topThree[2].userBalance)} {topThree[2]?.name}
              </Typography>
            </div>
          )}

          <div className="relative pt-6">
            <div className="overflow-hidden h-10 text-xs flex rounded-lg bg-gray-200 ">
              <Tooltip title={topThree[0]?.name}>
                <div
                  style={{
                    width:
                      percentage(topThree[0]?.userBalance, cashInPools) + '%',
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                ></div>
              </Tooltip>
              <Tooltip title={topThree[1]?.name}>
                <div
                  style={{
                    width:
                      percentage(topThree[1]?.userBalance, cashInPools) + '%',
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-200"
                ></div>
              </Tooltip>
              <Tooltip title={topThree[2]?.name}>
                <div
                  style={{
                    width:
                      percentage(topThree[2]?.userBalance, cashInPools) + '%',
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-300"
                ></div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}

export default BalanceBox;
