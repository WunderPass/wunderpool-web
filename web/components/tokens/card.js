import {
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SellIcon from '@mui/icons-material/Sell';
import axios from 'axios';

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
      {' '}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={2} direction="row" alignItems="center">
          <img width="50" src={token.image || '/favicon.ico'} alt="TKN" />
          <Stack spacing={1}>
            <Typography variant="h6">
              {token.name} ({token.symbol})
            </Typography>
            <Tooltip title={`Tokens: ${token.formattedBalance}`}>
              <div className="flex flex-col">
                <Typography variant="subtitle1" width="fit-content">
                  Total Balance: {token.usdValue}
                </Typography>
                <Typography>Price per token: {tokenPrice} $ </Typography>
                <Typography variant="subtitle1" width="fit-content">
                  Tokens Owned:{' '}
                  {token.formattedBalance > 1
                    ? parseFloat(token.formattedBalance).toFixed(3)
                    : parseFloat(token.formattedBalance).toFixed(8)}
                </Typography>
              </div>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
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
