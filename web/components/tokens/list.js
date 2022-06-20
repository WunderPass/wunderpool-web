import { Stack, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import SellTokenDialog from '../dialogs/sellTokenDialog';
import SwapTokenDialog from '/components/dialogs/swapTokenDialog';
import TokenCard from './card';

export default function TokenList(props) {
  const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const { tokens, poolAddress } = props;
  const [openSell, setOpenSell] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const [token, setToken] = useState('');
  const [hideSmallBalances, setHideSmallBalances] = useState(true);

  const toggleHideSmallBalances = () => {
    setHideSmallBalances(!hideSmallBalances);
  };

  const handleSell = (token) => {
    setOpenSell(true);
    setToken(token);
  };

  const handleSwap = (token) => {
    setOpenSwap(true);
    setToken(token);
  };

  useEffect(() => {
    const data = window.localStorage.getItem('CASAMA_HIDEBALANCES_STATE');
    if (data !== null) setHideSmallBalances(JSON.parse(data));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      'CASAMA_HIDEBALANCES_STATE',
      JSON.stringify(hideSmallBalances)
    );
  }, [hideSmallBalances]);

  return (
    <Stack spacing={2}>
      {tokens.length > 1 && (
        <button
          className="btn-neutral p-1 w-1/3 place-self-end "
          onClick={toggleHideSmallBalances}
        >
          <Typography className="text-xs mt-0.5">
            {hideSmallBalances ? 'Show all balances' : 'Hide small balances'}
          </Typography>
        </button>
      )}

      {tokens.length > 0 &&
        tokens
          .filter((tkn) => tkn.balance > 0)
          .map((token) => {
            if (token.address != usdcAddress) {
              if (!hideSmallBalances || token.usdValue > 0.0) {
                return (
                  <TokenCard
                    token={token}
                    key={`token-${token.address}`}
                    handleSell={handleSell}
                    handleSwap={handleSwap}
                  />
                );
              }
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
