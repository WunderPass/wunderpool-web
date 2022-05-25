import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';
import { toEthString, usdc } from '/services/formatter';

export default function JoinPoolDialog(props) {
  const {
    open,
    setOpen,
    loginCallback,
    handleSuccess,
    handleError,
    wunderPool,
  } = props;
  const { price, totalSupply, entryBarrier } = wunderPool.governanceToken;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    wunderPool
      .join(amount)
      .then((res) => {
        handleSuccess(`Joined Pool with ${amount} USD`);
        loginCallback();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
        setLoading(false);
      });
  };

  const receivedTokens =
    price > 0
      ? ethers.BigNumber.from(usdc(amount)).div(price)
      : ethers.BigNumber.from(100);
  const shareOfPool =
    totalSupply > 0
      ? receivedTokens.mul(price).div(totalSupply.add(receivedTokens))
      : ethers.BigNumber.from(100);

  const handleInput = (e) => {
    setAmount(e.target.value);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Join the Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You will receive Governance Tokens proportionally to your invest
        </DialogContentText>
        <DialogContentText>
          Price per Governance Token: {toEthString(price, 6)} USD
        </DialogContentText>
        <TextField
          autoFocus
          type="number"
          margin="dense"
          value={amount}
          onChange={handleInput}
          label="Invest Amount"
          placeholder="1"
          fullWidth
          inputProps={{ min: '0' }}
          InputProps={{
            endAdornment: <InputAdornment position="end">USD</InputAdornment>,
          }}
        />
        <DialogContentText>
          Governance Tokens: {receivedTokens.toString()}
        </DialogContentText>
        <DialogContentText>
          Share of Pool: {shareOfPool.toString()}%
        </DialogContentText>
      </DialogContent>
      {loading ? (
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1">Joining Pool...</Typography>
          <LinearProgress />
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn btn-danger" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={entryBarrier.gt(usdc(amount))}
          >
            Join
          </button>
        </DialogActions>
      )}
      {loading && (
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height="600"
        ></iframe>
      )}
    </Dialog>
  );
}
