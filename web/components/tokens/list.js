import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import SellTokenDialog from '../dialogs/sellTokenDialog';
import SwapTokenDialog from '/components/dialogs/swapTokenDialog';
import TokenCard from './card';

export default function TokenList(props) {
  const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const { tokens, poolAddress } = props;
  const [openSell, setOpenSell] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const [token, setToken] = useState('');

  const handleSell = (token) => {
    setOpenSell(true);
    setToken(token);
  };

  const handleSwap = (token) => {
    setOpenSwap(true);
    setToken(token);
  };

  return (
    <Stack spacing={2}>
      {tokens.length > 0 &&
        tokens
          .filter((tkn) => tkn.balance > 0)
          .map((token) => {
            if (token.address != usdcAddress) {
              return (
                <TokenCard
                  token={token}
                  key={`token-${token.address}`}
                  handleSell={handleSell}
                  handleSwap={handleSwap}
                />
              );
            }
          })}
      <SellTokenDialog
        open={openSell}
        setOpen={setOpenSell}
        token={token}
        {...props}
      />
      <SwapTokenDialog
        open={openSwap}
        setOpen={setOpenSwap}
        token={token}
        {...props}
      />
    </Stack>
  );
}
