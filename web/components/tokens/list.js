import { Stack, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import SellTokenDialog from '../dialogs/sellTokenDialog';
import SwapTokenDialog from '/components/dialogs/swapTokenDialog';
import TokenCard from './card';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

export default function TokenList(props) {
  const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const { tokens } = props;
  const [openSell, setOpenSell] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const [token, setToken] = useState('');
  const [hideSmallBalances, setHideSmallBalances] = useState(true);
  const [isSmallBalances, setIsSmallBalances] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const handleOpenClose = () => {
    if (openSell) {
      goBack(() => removeQueryParam('sellToken'));
    } else {
      setToken(token);
      addQueryParam({ sellToken: 'sellToken' }, false);
    }
  };

  useEffect(() => {
    setOpenSell(router.query?.sellToken ? true : false);
  }, [router.query]);

  const triggerSmallBalances = () => {
    setIsSmallBalances(true);
  };

  const toggleHideSmallBalances = () => {
    setHideSmallBalances(!hideSmallBalances);
  };

  const handleSwap = (token) => {
    setOpenSwap(true);
    setToken(token);
  };

  useEffect(() => {
    tokens.length > 0 &&
      tokens
        .filter((tkn) => tkn.balance > 0)
        .map((token) => {
          if (token.usdValue < 0.01) {
            triggerSmallBalances();
          }
        });
  }, []);

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
                    handleSell={handleOpenClose}
                    handleSwap={handleSwap}
                  />
                );
              }
            }
          })}

      <SellTokenDialog
        open={openSell}
        setOpen={handleOpenClose}
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
