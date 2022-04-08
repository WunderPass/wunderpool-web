import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input, InputAdornment, InputLabel, LinearProgress, OutlinedInput, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { fundPool } from "/services/contract/pools";

export default function FundPoolDialog(props) {
  const {open, setOpen, address, handleSuccess, handleError} = props;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount("");
    setOpen(false);
    setLoading(false)
  }

  const handleSubmit = () => {
    setLoading(true);
    fundPool(address, amount).then((res) => {
      handleSuccess(`Funded Pool with ${amount} USD`)
      handleClose();
    }).catch((err) => {
      handleError(err);
      setLoading(false);
    })
  }

  const handleInput = (e) => {
    setAmount(e.target.value);
  }

  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Send USD to Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>Send USD to the Pool. You will get more Governance Tokens in exchange</DialogContentText>
        <TextField autoFocus type="number" margin="dense" value={amount} onChange={handleInput} label="Amount" placeholder="1" fullWidth InputProps={{endAdornment: <InputAdornment position="end">USD</InputAdornment>}}/>
      </DialogContent>
      {loading ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Transferring USD...</Typography>
          <LinearProgress />
        </Stack> :
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="success" disabled={Number(amount) <= 0}>Send</Button>
        </DialogActions>
      }
    </Dialog>
  )
}