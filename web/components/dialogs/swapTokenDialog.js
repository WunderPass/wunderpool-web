import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input, InputAdornment, InputLabel, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { fetchERC20Data } from "/services/contract/token";
import { createSwapSuggestion } from "/services/contract/proposals";

export default function SwapTokenDialog(props) {
  const {open, setOpen, name, address, symbol, balance, poolAddress, fetchProposals, handleError, handleSuccess} = props;
  const [amount, setAmount] = useState("");
  const [receiveName, setReceiveName] = useState("");
  const [receiveSymbol, setReceiveSymbol] = useState("");
  const [receiveAddress, setReceiveAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount("");
    setReceiveName("");
    setReceiveSymbol("");
    setReceiveAddress("");
    setLoading(false);
    setOpen(false);
  }

  const handleSubmit = () => {
    setLoading(true);
    createSwapSuggestion(poolAddress, address, receiveAddress, `Let's Swap ${name} (${symbol}) for ${receiveName} (${receiveSymbol})`, `We will swap ${amount} ${symbol} for ${receiveSymbol}`, amount).then((res) => {
      console.log(res);
      handleSuccess(`Created Proposal to Swap ${name}`)
      fetchProposals();
      handleClose();
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setLoading(false)
    });
  }

  const handleInput = (e) => {
    const addr = e.target.value;
    setReceiveAddress(addr);
    if (addr.length == 42) {
      fetchERC20Data(addr).then(res => {
        setReceiveName(res.name);
        setReceiveSymbol(res.symbol);
      })
    } else {
      setTokenName(null);
      setTokenSymbol(null);
    }
  }

  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Swap {name}</DialogTitle>
      <DialogContent sx={{minWidth: '50vw'}}>
        <Stack spacing={2}>
          <TextField autoFocus type="number" margin="dense" value={amount} onChange={(e) => setAmount(e.target.value)} label="Amount" placeholder="1" fullWidth InputProps={{endAdornment: <InputAdornment position="end"><Button onClick={() => setAmount(balance)}>MAX</Button></InputAdornment>}}/>
          <DialogContentText>For</DialogContentText>
          <TextField value={receiveAddress} onChange={handleInput} label="Receive Token" placeholder="0xc2132D05D31c914a87C6611C10748AEb04B58e8F"/>
          {receiveName && <Typography variant="h6">{receiveName} ({receiveSymbol})</Typography>}
        </Stack>
      </DialogContent>
      {loading ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Creating your Proposal...</Typography>
          <LinearProgress />
        </Stack> :
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="success" disabled={Number(amount) > Number(balance) || receiveName.length < 1}>Swap</Button>
        </DialogActions>
      }
    </Dialog>
  )
}