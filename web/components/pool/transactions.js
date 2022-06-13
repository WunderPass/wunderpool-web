import { useState, useEffect } from 'react';
import { Skeleton, Link, Typography } from '@mui/material';
import { normalTransactions } from '/services/contract/pools';
import { weiToMatic } from '/services/formatter';
import { encodeParams } from '/services/formatter';

export default function Transactions(props) {
  const { wunderPool } = props;
  const [allTransactions, setAllTransactions] = useState();

  const unixTimeToDate = (unixTime) => {
    const date = new Date(unixTime * 1000);
    return date.toLocaleDateString('de-DE');
  };

  const calculateTrxFee = (gasUsed, gasPrice) => {
    const trxCost = gasUsed * gasPrice;
    return weiToMatic(trxCost);
  };

  useEffect(async () => {
    const resolved = await new Promise(async (resolve) => {
      const res = await normalTransactions(wunderPool.poolAddress);
      resolve(res);
    });
    setAllTransactions(resolved.result);
  }, [wunderPool.poolAddress]);

  return allTransactions ? (
    <div>
      {allTransactions.map((trx, i) => {
        return (
          <div className="container-gray mb-4">
            <div className="flex flex-col justify-between items-start max-w-screen overflow-x-auto">
              <Typography className="text-lg">
                Transaction #{allTransactions.length - i}
              </Typography>
              <div className="text-sm truncate ">
                Hash:
                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/tx/${trx.hash}`}
                >
                  <Typography className="text-sm opacity-90 py-1 truncate ... text-kaico-blue cursor-pointer">
                    {trx.hash}
                  </Typography>
                </Link>
              </div>

              <div className="text-sm ">
                Block:{' '}
                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/block/${trx.blockNumber}`}
                >
                  <Typography className="text-sm opacity-90 py-1 truncate ... text-kaico-blue cursor-pointer">
                    {trx.blockNumber}
                  </Typography>
                </Link>
              </div>
              <div className="text-sm ">
                Date: {unixTimeToDate(trx.timeStamp)}
              </div>
              <div className="text-sm ">
                From:{' '}
                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/address/${trx.from}`}
                >
                  <Typography className="text-sm opacity-90 py-1 truncate ... text-kaico-blue cursor-pointer">
                    {trx.from}
                  </Typography>
                </Link>
              </div>
              <div className="text-sm ">
                To:{' '}
                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/address/${trx.to}`}
                >
                  <Typography className="text-sm opacity-90 py-1 truncate ... text-kaico-blue cursor-pointer">
                    {trx.to}
                  </Typography>
                </Link>
              </div>
              <div className="text-sm ">Value: {trx.value}</div>
              <div className="text-sm ">
                Fee: {calculateTrxFee(trx.gasUsed, trx.gasPrice).toFixed(6)}{' '}
                MATIC
              </div>
              <div className="text-sm ">_________________________________</div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="md:ml-4">
      <Skeleton width="100%" height={100} />
    </div>
  );
}
