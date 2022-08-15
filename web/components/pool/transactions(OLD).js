import { useState, useEffect } from 'react';
import { Skeleton, Link, Typography } from '@mui/material';
import { normalTransactions } from '/services/contract/pools';
import { weiToMatic } from '/services/formatter';

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
          <div key={`pool-transaction-${i}`} className="container-gray mb-4">
            <div className="flex flex-col justify-between items-start max-w-screen overflow-x-auto">
              <Typography className="text-lg mb-1">
                Transaction #{allTransactions.length - i}
              </Typography>
              <div className="flex flex-row truncate items-center">
                <Typography className="mr-1">Hash: </Typography>
                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/tx/${trx.hash}`}
                >
                  <Typography className="opacity-90 text-kaico-blue cursor-pointer">
                    {trx.hash}
                  </Typography>
                </Link>
              </div>

              <div className="flex flex-row items-center">
                <Typography className="mr-1"> Block: </Typography>

                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/block/${trx.blockNumber}`}
                >
                  <Typography className="opacity-90  text-kaico-blue cursor-pointer">
                    {trx.blockNumber}
                  </Typography>
                </Link>
              </div>
              <div className="flex flex-row">
                <Typography>Date: {unixTimeToDate(trx.timeStamp)}</Typography>
              </div>
              <div className="flex flex-row  items-center">
                <Typography className="mr-1">From: </Typography>

                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/address/${trx.from}`}
                >
                  <Typography className=" opacity-90 text-kaico-blue cursor-pointer">
                    {trx.from}
                  </Typography>
                </Link>
              </div>
              <div className="flex flex-row  items-center">
                <Typography className="mr-1"> To: </Typography>

                <Link
                  className="cursor-pointer"
                  target="_blank"
                  href={`https://polygonscan.com/address/${trx.to}`}
                >
                  <Typography className=" opacity-90 text-kaico-blue cursor-pointer">
                    {trx.to}
                  </Typography>
                </Link>
              </div>
              <div className="">
                <Typography>Value: {trx.value}</Typography>
              </div>
              <div className="mb-1">
                <Typography>
                  {' '}
                  Fee: {calculateTrxFee(trx.gasUsed, trx.gasPrice).toFixed(
                    6
                  )}{' '}
                  MATIC
                </Typography>
              </div>
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
