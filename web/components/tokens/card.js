import {
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { currency } from '/services/formatter';

export default function TokenCard(props) {
  const { token, handleSell, handleSwap } = props;
  const [waitingForPrice, setWaitingForPrice] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(false);

  useEffect(() => {
    if (token.address && token.address.length == 42) {
      setWaitingForPrice(true);
      axios({
        url: `/api/tokens/price`,
        params: { address: token.address },
      }).then((res) => {
        setTokenPrice(res.data?.dollar_price);
        setWaitingForPrice(false);
      });
    }
  }, [token.address]);

  return (
    <div className="container-gray">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center w-full">
            <img
              className="mr-4"
              width="50"
              src={token.image || '/favicon.ico'}
              alt="TKN"
            />

            <div className="flex flex-col w-full justify-between">
              <div className="flex flex-row justify-between items-center mb-1">
                <Typography className="text-2xl">{token.name}</Typography>
                <Typography className="text-2xl" width="fit-content">
                  {currency(token.usdValue, {})}
                </Typography>
              </div>
              <div className="flex flex-col sm:flex-row  justify-between items-center ">
                <Typography className="w-full sm:w-auto">
                  1 {token.symbol} = $
                  {tokenPrice >= 0.01
                    ? parseFloat(tokenPrice).toFixed(2)
                    : tokenPrice > 0.001
                    ? parseFloat(tokenPrice).toFixed(6)
                    : tokenPrice}{' '}
                </Typography>
                <Typography className="w-full sm:w-auto">
                  {token.formattedBalance > 1
                    ? parseFloat(token.formattedBalance).toFixed(3)
                    : parseFloat(token.formattedBalance).toFixed(8)}{' '}
                  {token.symbol}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <button
          className="rounded-xl btn-kaico w-full p-2 my-2 mt-4"
          onClick={() => handleSell(token)}
        >
          Sell
        </button>
        <button
          className="border-kaico-blue rounded-xl btn-neutral w-full p-2 border"
          onClick={() => handleSwap(token)}
        >
          Swap
        </button>
      </div>
    </div>
  );
}
