import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { liquidatePool } from "/services/contract/pools";

export default function DestroyPoolDialog(props) {
  const router = useRouter();
  const {open, setOpen, address, name, handleSuccess, handleError} = props;
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  }

  const handleSubmit = () => {
    setLoading(true);
    liquidatePool(address).then((res) => {
      console.log(res);
      handleSuccess(`Liquidated and transferred Funds of ${name} to all Members`);
      router.push('/pools');
    }).catch((err) => {
      handleError(err);
      setLoading(false);
    })
  }

  return(
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Liquidate Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>This will transfer all Funds from the Pool equally to all of its Members.</DialogContentText>
        <Alert severity="error">This action can't be undone</Alert>
      </DialogContent>
      {loading ? 
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="subtitle1">Liquidating WunderPool...</Typography>
          <LinearProgress />
        </Stack> :
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="error">Liquidate</Button>
        </DialogActions>
      }
    </Dialog>
  )
}