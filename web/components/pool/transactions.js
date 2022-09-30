import { useState, useEffect } from 'react';
import { Skeleton } from '@mui/material';
import { allPolygonscanTransactions } from '/services/polygonscan';
import TransactionCard from './transactionCard';

export default function Transactions(props) {
  const { wunderPool } = props;
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    if (wunderPool.poolAddress) {
      allPolygonscanTransactions(wunderPool.poolAddress)
        .then((transactions) => {
          console.log(transactions);
          setAllTransactions(transactions);
        })
        .catch((err) => {
          setAllTransactions([]);
        });
    }
    return () => {
      setAllTransactions([]);
    };
  }, [wunderPool.poolAddress]);

  return allTransactions ? (
    <div>
      {allTransactions
        .sort((a, b) => b.timeStamp - a.timeStamp)
        .map((trx, i) => {
          return (
            <TransactionCard
              key={`pool-transaction-${i}`}
              transaction={trx}
              number={allTransactions.length - i}
              {...props}
            />
          );
        })}
    </div>
  ) : (
    <div className="md:ml-4">
      <Skeleton width="100%" height={100} />
    </div>
  );
}
