import axios from 'axios';
import { useState, useEffect } from 'react';
import { Skeleton, Typography } from '@mui/material';
import { AiOutlinePlus } from 'react-icons/ai';
import InviteMemberDialog from '/components/dialogs/inviteMember';
import JoinPoolDialog from '/components/dialogs/joinPool';
import InitialsAvatar from '../utils/initialsAvatar';
import { FaBan } from 'react-icons/fa';
import { BsLink45Deg } from 'react-icons/bs';
import { normalTransactions } from '/services/contract/pools';
import { weiToMatic } from '/services/formatter';
import { encodeParams } from '/services/formatter';

export default function Transactions(props) {
  const { wunderPool } = props;
  const { isReady } = wunderPool;
  const [isLoading, setIsLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState(null);

  const unixTimeToDate = (unixTime) => {
    const date = new Date(unixTime * 1000);
    return date.toLocaleDateString('de-DE');
  };

  const calculateTrxFee = (gasUsed, gasPrice) => {
    const trxCost = gasUsed * gasPrice;
    return weiToMatic(trxCost);
  };

  const encode = (input) => {
    const types = ['uint'];
    const values = [input];
    console.log(types);
    console.log(values);
    return encodeParams(types, values);
  };

  useEffect(async () => {
    await new Promise(async (resolve, reject) => {
      const res = await normalTransactions(wunderPool.address);
      console.log('data:');
      console.log(allTransactions);
      setIsLoading(false);
      setAllTransactions(res);
      resolve(res);
    });
  }, [wunderPool.address]);

  return allTransactions ? (
    <div>
      {allTransactions.map((trx, i) => {
        return (
          <div className="flex flex-col justify-between items-start">
            <div className="text-sm truncate">Hash: {trx.hash}</div>

            <div className="text-sm truncate">Block: {trx.blockNumber}</div>
            <div className="text-sm truncate">
              Date: {unixTimeToDate(trx.timeStamp)}
            </div>
            <div className="text-sm truncate">From: {trx.from}</div>
            <div className="text-sm truncate">To: {trx.to}</div>
            <div className="text-sm truncate">Value: {trx.value}</div>
            <div className="text-sm truncate">
              Fee: {calculateTrxFee(trx.gasUsed, trx.gasPrice)} MATIC
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
