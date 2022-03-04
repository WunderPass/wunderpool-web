import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, InputAdornment, InputLabel, LinearProgress, OutlinedInput, Stack, Typography } from "@mui/material";
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
      setAmount("");
      handleSuccess(`Funded Pool with ${amount} MATIC`)
      console.log(res)
      setOpen(false);
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setLoading(false);
    });
  }

  const handleInput = (e) => {
    setAmount(e.target.value);
  }

  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Send MATIC to Pool</DialogTitle>
      <DialogContent sx={{minWidth: '50vw'}}>
        <InputLabel>Amount</InputLabel>
        <Input type="number" value={amount} onChange={handleInput} label="Amount" placeholder="1" fullWidth endAdornment={<InputAdornment position="end">MATIC</InputAdornment>}/>
      </DialogContent>
      {loading ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Transferring MATIC...</Typography>
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