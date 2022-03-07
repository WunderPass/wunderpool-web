import { Button, Collapse, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { fetchERC20Data } from '/services/contract/token';
import { createApeSuggestion } from '/services/contract/proposals';

export default function ApeForm(props) {
  const {setApe, address, fetchProposals, handleSuccess, handleError} = props;
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState(null);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setTokenAddress("");
    setTokenName(null);
    setTokenSymbol(null);
    setValue(0)
    setLoading(false);
    setApe(false);
  }

  const handleApe = (e) => {
    e.preventDefault();
    setLoading(true);
    createApeSuggestion(address, tokenAddress, `Let's Ape into ${tokenName} (${tokenSymbol})`, `We will ape ${value} MATIC into ${tokenName}`, value).then(res => {
      console.log(res);
      handleSuccess(`Created Proposal to Ape into ${tokenSymbol}`);
      fetchProposals();
      handleClose();
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setLoading(false);
    })
  }

  const handleInput = (e) => {
    const addr = e.target.value;
    setTokenAddress(addr);
    if (addr.length == 42) {
      fetchERC20Data(addr).then(res => {
        setTokenName(res.name);
        setTokenSymbol(res.symbol);
      })
    } else {
      setTokenName(null);
      setTokenSymbol(null);
    }
  }

  const handleValueInput = (e) => {
    setValue(e.target.value);
  }

  return (
    <form>
      <Stack width="100%" spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">APE</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <TextField value={tokenAddress} onChange={handleInput} placeholder="Address"/>
        <Collapse in={tokenName && tokenSymbol ? true : false}>
          <Stack spacing={3}>
            <Typography variant="h4">{tokenName} ({tokenSymbol})</Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Ape Amount</InputLabel>
              <OutlinedInput type="number" value={value} onChange={handleValueInput} label="Ape Amount" placeholder="1" endAdornment={<InputAdornment position="end">MATIC</InputAdornment>}/>
            </FormControl>
          </Stack>
        </Collapse>
        {loading ? 
          <Button disabled variant="contained">Submitting Proposal...</Button> :
          <Button type="submit" disabled={!tokenName || !tokenSymbol || value == 0} onClick={handleApe} variant="contained">Ape Empfehlung abgeben</Button>
        }
      </Stack>
    </form>
  )
}
