import { Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import SellTokenDialog from "../dialogs/sellTokenDialog";
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ethers } from "ethers";

export default function TokenList(props) {
  const {tokens, poolAddress, handleFund, handleWithdraw, poolBalance} = props;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [symbol, setSymbol] = useState("");
  const [balance, setBalance] = useState("");

  const handleSell = (token) => {
    setOpen(true);
    setAddress(token.address)
    setName(token.name)
    setSymbol(token.symbol)
    setBalance(token.balance.toString())
  }

  return(
    <Stack spacing={3} pt={2}>
      <Typography variant="h4">Tokens</Typography>
      <Paper elevation={3} sx={{p: 2}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="h6">MATIC</Typography>
            <Typography variant="subtitle1">Balance: {poolBalance.toNumber()}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="center">
            <IconButton color="success" onClick={handleFund}><AttachMoneyIcon /></IconButton>
            <IconButton color="error" disabled={poolBalance.toNumber() == 0} onClick={handleWithdraw}><CallReceivedIcon /></IconButton>
          </Stack>
        </Stack>
      </Paper>
      {tokens.length > 0 &&
        tokens.map(token => {
          return (
            <Paper elevation={3} key={`token-${token.address}`} sx={{p: 2}}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={1}>
                  <Typography variant="h6">{token.name} ({token.symbol})</Typography>
                  <Typography variant="subtitle1">Balance: {token.formattedBalance}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="center">
                  <Button color="error" disabled={token.balance == 0} onClick={() => handleSell(token)}>Sell</Button>
                </Stack>
              </Stack>
            </Paper>
          )
        })
      }
      <SellTokenDialog open={open} setOpen={setOpen} name={name} address={address} symbol={symbol} balance={balance} poolAddress={poolAddress} {...props}/>
    </Stack>
  )
}