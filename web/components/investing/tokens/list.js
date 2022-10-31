import { Stack, Typography } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import SellTokenDialog from '/components/investing/dialogs/sellTokenDialog';
import SwapTokenDialog from '/components/investing/dialogs/swapTokenDialog';
import TokenCard from './card';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

export default function TokenList(props) {
  const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const { tokens } = props;
  const [token, setToken] = useState('');
  const [hideSmallBalances, setHideSmallBalances] = useState(true);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const openSell = useMemo(
    () => router.query?.dialog == 'sellToken',
    [router.query.dialog]
  );
  const openSwap = useMemo(
    () => router.query?.dialog == 'swapToken',
    [router.query.dialog]
  );
  const isSmallBalances = useMemo(
    () =>
      tokens.filter((tkn) => tkn.balance > 0 && tkn.usdValue < 0.01).length > 0,
    [tokens.length]
  );

  const handleSell = (token) => {
    if (openSell) {
      setToken('');
      goBack(() => removeQueryParam('dialog'));
    } else {
      setToken(token);
      addQueryParam({ dialog: 'sellToken' }, false);
    }
  };

  const handleSwap = (token) => {
    if (openSwap) {
      setToken('');
      goBack(() => removeQueryParam('dialog'));
    } else {
      setToken(token);
      addQueryParam({ dialog: 'swapToken' }, false);
    }
  };

  const toggleHideSmallBalances = () => {
    setHideSmallBalances(!hideSmallBalances);
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
      {isSmallBalances && (
        <button
          className="btn-neutral p-1 mt-2 w-1/3 place-self-end "
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
              if (!hideSmallBalances || token.usdValue > 0.009) {
                return (
                  <TokenCard
                    token={token}
                    key={`token-${token.address}`}
                    handleSell={() => handleSell(token)}
                    handleSwap={() => handleSwap(token)}
                  />
                );
              }
            }
          })}

      <SellTokenDialog
        open={openSell}
        handleOpenClose={handleSell}
        token={token}
        {...props}
      />
      <SwapTokenDialog
        open={openSwap}
        setOpen={handleSwap}
        token={token}
        {...props}
      />
    </Stack>
  );
}
