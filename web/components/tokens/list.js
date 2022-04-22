import { Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import SellTokenDialog from "../dialogs/sellTokenDialog";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { toEthString } from "/services/formatter";
import SwapTokenDialog from "/components/dialogs/swapTokenDialog";
import TokenCard from "./card";

export default function TokenList(props) {
  const { tokens, poolAddress, handleFund, handleWithdraw, poolBalance } =
    props;
  const [openSell, setOpenSell] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [symbol, setSymbol] = useState("");
  const [balance, setBalance] = useState("");

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

  return (
    <Stack spacing={3} pt={2}>
      <Typography variant="h4">Tokens</Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <Typography variant="h6">USD</Typography>
            <Typography variant="subtitle1">
              Balance:{" "}
              {typeof poolBalance == "number"
                ? poolBalance
                : toEthString(poolBalance, 6)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="center">
            <IconButton color="success" onClick={handleFund}>
              <AttachMoneyIcon />
            </IconButton>
            <IconButton
              color="error"
              disabled={poolBalance == 0}
              onClick={handleWithdraw}
            >
              <CallReceivedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
      {tokens.length > 0 &&
        tokens
          .filter((tkn) => tkn.balance > 0)
          .map((token) => {
            return <TokenCard token={token} key={`token-${token.address}`} />;
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
