import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { createPool } from "/services/contract/pools";

export default function NewPoolDialog(props) {
  const {open, setOpen, fetchPools, handleSuccess, handleError} = props;
  const [name, setName] = useState("");
  const [waitingForPool, setWaitingForPool] = useState(false);

  const handleClose = () => {
    setName("");
    setOpen(false);
  }

  const handleSubmit = () => {
    setWaitingForPool(true);
    createPool(name).then((res) => {
      console.log(res)
      setName("");
      setOpen(false);
      handleSuccess(`Created Pool "${name}"`)
      fetchPools();
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setWaitingForPool(false);
    });
  }

  const handleInput = (e) => {
    setName(e.target.value);
  }

  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New WunderPool</DialogTitle>
      <DialogContent>
        <DialogContentText>Create a new WunderPool to Invest with your friends</DialogContentText>
        <TextField autoFocus margin="dense" label="Pool Name" placeholder="CryptoApes" fullWidth variant="standard" value={name} onChange={handleInput}/>
      </DialogContent>
      {waitingForPool ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Creating your Pool...</Typography>
          <LinearProgress />
        </Stack> :
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="success" disabled={name.length < 3}>Create</Button>
        </DialogActions>
      }
    </Dialog>
  )
}