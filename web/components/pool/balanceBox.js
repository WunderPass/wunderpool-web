import { Typography, Skeleton } from '@mui/material';
import getPoolsInfo from '/components/pool/poolsInfo';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';

function balanceBox(props) {
  const { user } = props;
  const [nameBalances] = getPoolsInfo(user.pools);
  const [finalTotalBalance, setFinalTotalBalance] = useState();
  const [userBalance, setUserBalance] = useState();
  const [poolABalance, setPoolABalance] = useState();
  const [poolBBalance, setPoolBBalance] = useState();
  const [poolCBalance, setPoolCBalance] = useState();
  const [poolAName, setPoolAName] = useState();
  const [poolBName, setPoolBName] = useState();
  const [poolCName, setPoolCName] = useState();
  const [loading, setLoading] = useState(true);

  const calculateTotalBalance = () => {
    if (user.usdBalance != null) {
      var usdValueAsNumber = Number(user.usdBalance.replace(/[^0-9.-]+/g, ''));
      setUserBalance(usdValueAsNumber);
      var sum = nameBalances.reduce((partialSum, a) => partialSum + a[0], 0);
      sum += usdValueAsNumber;
    }
    setFinalTotalBalance(sum);
  };

  const sortPoolsTop3 = () => {
    nameBalances.sort(sortFunction);
    if (nameBalances.length != 0) {
      if (nameBalances.length >= 1) {
        setPoolABalance(nameBalances[0][0]);
        setPoolAName(nameBalances[0][1]);
      }
      if (nameBalances.length >= 2) {
        setPoolBBalance(nameBalances[1][0]);
        setPoolBName(nameBalances[1][1]);
      }
      if (nameBalances.length >= 3) {
        setPoolCBalance(nameBalances[2][0]);
        setPoolCName(nameBalances[2][1]);
      }
    }
  };

  function sortFunction(a, b) {
    if (a[0] === b[0]) {
      return 0;
    } else {
      return a[0] > b[0] ? -1 : 1;
    }
  }

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  useEffect(() => {
    if (user.usdBalance && nameBalances) {
      calculateTotalBalance();
      sortPoolsTop3();
      setLoading(false);
    }
  }, [user.usdBalance, nameBalances]);

  return !loading ? (
    <div className="sm:h-full sm:max-h-96 ">
      <div className="flex sm:h-full flex-col justify-between container-kaico mb-1 m:mr-8 w-full ">
        <Typography className="pb-6">Total Balance</Typography>
        <Typography className="text-3xl ">
          {currency(finalTotalBalance, {})}
        </Typography>

        {nameBalances.length >= 1 && (
          <div className="flex flex-row items-center">
            <div className="h-3 w-3 mt-3 bg-red-500 rounded-sm mr-2" />
            <Typography className="pt-5 py-2 truncate">
              {currency(poolABalance, {})} {poolAName}
            </Typography>
          </div>
        )}

        {nameBalances.length >= 2 && (
          <div className="flex flex-row items-center">
            <div className="h-3 w-3 bg-yellow-200 rounded-sm mr-2 " />
            <Typography className="py-2 truncate">
              {currency(poolBBalance, {})} {poolBName}
            </Typography>
          </div>
        )}

        {nameBalances.length >= 3 && (
          <div className="flex flex-row items-center">
            <div className="h-3 w-3 bg-pink-300 rounded-sm mr-2" />
            <Typography className="py-2 truncate">
              {currency(poolCBalance, {})} {poolCName}
            </Typography>
          </div>
        )}

        <div className="relative pt-6">
          <div className="overflow-hidden h-10  text-xs flex rounded-lg bg-gray-200 ">
            <div
              style={{
                width:
                  percentage(poolABalance, finalTotalBalance - userBalance) +
                  '%',
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
            ></div>
            <div
              style={{
                width:
                  percentage(poolBBalance, finalTotalBalance - userBalance) +
                  '%',
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-200"
            ></div>
            <div
              style={{
                width:
                  percentage(poolCBalance, finalTotalBalance - userBalance) +
                  '%',
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-300"
            ></div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}

export default balanceBox;
