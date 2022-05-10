import { Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import SellTokenDialog from '../dialogs/sellTokenDialog';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { toEthString } from '/services/formatter';
import SwapTokenDialog from '/components/dialogs/swapTokenDialog';
import TokenCard from './card';

export default function TokenList(props) {
  const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const { tokens, poolAddress, handleFund, handleWithdraw } = props;
  const [openSell, setOpenSell] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState('');

  const handleSell = (token) => {
    setOpenSell(true);
    setAddress(token.address);
    setName(token.name);
    setSymbol(token.symbol);
    setBalance(token.balance.toString());
  };

  const handleSwap = (token) => {
    setOpenSwap(true);
    setAddress(token.address);
    setName(token.name);
    setSymbol(token.symbol);
    setBalance(token.balance.toString());
  };

  console.log(tokens.address);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Tokens</Typography>
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
        name={name}
        address={address}
        symbol={symbol}
        balance={balance}
        poolAddress={poolAddress}
        {...props}
      />
      <SwapTokenDialog
        open={openSwap}
        setOpen={setOpenSwap}
        name={name}
        address={address}
        symbol={symbol}
        balance={balance}
        poolAddress={poolAddress}
        {...props}
      />
    </Stack>
  );
}
