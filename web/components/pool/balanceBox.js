import { Typography, Skeleton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

function BalanceBox(props) {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [open, setOpen] = useState(false);
  const [remainingPoolsBalance, setRemainingPoolsBalance] = useState(0);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const pools = user.pools;
  const topThree = pools
    .sort((a, b) => b.userBalance - a.userBalance)
    .slice(0, 4);
  const cashInPools = pools
    .map((p) => p.userBalance)
    .reduce((a, b) => a + b, 0);

  useEffect(() => {
    const topThreeTogether = topThree
      .map((p) => p.userBalance)
      .slice(0, 3)
      .reduce((a, b) => a + b, 0);
    setRemainingPoolsBalance(cashInPools - topThreeTogether);
  }, [cashInPools]);

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }
  const handleOpenClose = () => {
    if (open) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'createPool' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.dialog ? true : false);
  }, [router.query]);

  useEffect(() => {
    if (user.usdBalance) {
      setTotalBalance(cashInPools);
    }
  }, [user.usdBalance, cashInPools]);

  useEffect(() => {
    if (user.isReady) {
      setLoading(false);
    }
    console.log(topThree);
  }, [user.isReady]);

  return !loading ? (
    <>
      <div className="sm:h-full sm:max-h-96 ">
        <div className="flex sm:h-full flex-col justify-between container-white mb-1 m:mr-8 w-full ">
          <div>
            <Typography className="pb-6">Total Pool Balances</Typography>
            <Typography className="text-3xl ">
              {currency(totalBalance)}
            </Typography>
            {topThree.length == 0 && (
              <div className="flex flex-row items-center">
                <Typography className="pt-5 py-1 truncate">
                  No Pools joined yet{' '}
                </Typography>
              </div>
            )}
            {topThree.length > 0 && (
              <div className="flex flex-row items-center">
                <div className="h-3 w-3 mt-3 bg-brown rounded-sm mr-2" />
                <Typography className="pt-5 py-1 truncate">
                  {currency(topThree[0]?.userBalance)} {topThree[0]?.name}
                </Typography>
              </div>
            )}
            {topThree.length > 1 && (
              <div className="flex flex-row items-center">
                <div className="h-3 w-3 mt-3 bg-purple rounded-sm mr-2" />
                <Typography className="pt-5 py-1 truncate">
                  {currency(topThree[1]?.userBalance)} {topThree[1]?.name}
                </Typography>
              </div>
            )}
            {topThree.length > 2 && (
              <div className="flex flex-row items-center">
                <div className="h-3 w-3 mt-3 bg-powder-blue rounded-sm mr-2" />
                <Typography className="pt-5 py-1 truncate">
                  {currency(topThree[2].userBalance)} {topThree[2]?.name}
                </Typography>
              </div>
            )}
            {topThree.length > 3 && (
              <div className="flex flex-row items-center">
                <div className="h-3 w-3 mt-3 bg-gray-200 rounded-sm mr-2" />
                <Typography className="pt-5 py-1 truncate">
                  {currency(remainingPoolsBalance)} other pools
                </Typography>
              </div>
            )}
          </div>

          {topThree.length > 0 ? (
            <div className="relative pt-6">
              <div className="overflow-hidden h-10 text-xs flex rounded-lg bg-gray-200 ">
                <Tooltip title={topThree[0]?.name}>
                  <div
                    style={{
                      width:
                        percentage(topThree[0]?.userBalance, cashInPools) + '%',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brown"
                  ></div>
                </Tooltip>
                <Tooltip title={topThree[1]?.name}>
                  <div
                    style={{
                      width:
                        percentage(topThree[1]?.userBalance, cashInPools) + '%',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple"
                  ></div>
                </Tooltip>
                <Tooltip title={topThree[2]?.name}>
                  <div
                    style={{
                      width:
                        percentage(topThree[2]?.userBalance, cashInPools) + '%',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-powder-blue"
                  ></div>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="flex w-full "></div>
          )}
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
