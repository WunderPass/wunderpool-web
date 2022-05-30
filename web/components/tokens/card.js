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

    console.log(token.address);
  }, [token.address]);

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
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
                  Tokens Owned: {token.formattedBalance}
                </Typography>
              </div>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Tooltip title="Swap Token">
            <IconButton color="info" onClick={() => handleSwap(token)}>
              <CurrencyExchangeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sell Token">
            <IconButton color="success" onClick={() => handleSell(token)}>
              <SellIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
