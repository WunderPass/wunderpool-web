import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { createFudSuggestion } from '/services/contract/proposals';

export default function SellTokenDialog(props) {
  const {
    open,
    setOpen,
    name,
    address,
    symbol,
    balance,
    poolAddress,
    fetchProposals,
    handleError,
    handleSuccess,
  } = props;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount('');
    setLoading(false);
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    createFudSuggestion(
      poolAddress,
      address,
      `Let's Sell ${name} (${symbol})`,
      `We will sell ${amount} ${symbol}`,
      amount
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Proposal to sell ${name}`);
        fetchProposals();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setLoading(false);
      });
  };

  const handleInput = (e) => {
    setAmount(e.target.value);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>Sell {name}</DialogTitle>
      <DialogContent className="min-h-10">
        <TextField
          autoFocus
          type="number"
          margin="dense"
          value={amount}
          onChange={handleInput}
          label="Amount"
          placeholder="1"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <button
                  className="btn-default"
                  onClick={() => setAmount(balance)}
                >
                  MAX
                </button>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      {loading ? (
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1">Creating your Proposal...</Typography>
          <LinearProgress />
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn-default" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-default"
            onClick={handleSubmit}
            color="success"
            disabled={Number(amount) > Number(balance)}
          >
            Sell
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
