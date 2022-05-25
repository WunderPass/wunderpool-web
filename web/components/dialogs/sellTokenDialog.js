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
import { useEffect, useState } from 'react';
import { createFudSuggestion } from '/services/contract/proposals';
import axios from 'axios';

export default function SellTokenDialog(props) {
  const {
    open,
    setOpen,
    name,
    address,
    symbol,
    balance,
    wunderPool,
    handleError,
    handleSuccess,
  } = props;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForPrice, setWaitingForPrice] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(false);

  const handleClose = () => {
    setAmount('');
    setLoading(false);
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    wunderPool
      .fudSuggestion(
        address,
        `Let's Sell ${name} (${symbol})`,
        `We will sell ${amount} ${symbol}`,
        amount
      )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Proposal to sell ${name}`);
        wunderPool.determineProposals();
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

  useEffect(() => {
    if (address && address.length == 42) {
      setWaitingForPrice(true);
      axios({
        url: `/api/tokens/price`,
        params: { address: address },
      }).then((res) => {
        setTokenPrice(res.data?.dollar_price);
        console.log(res.data?.dollar_price);
        setWaitingForPrice(false);
      });
    }
  }, [address]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>Sell {name}</DialogTitle>
      <DialogContent className="min-h-10">
        <Typography>Price per token: {tokenPrice} $</Typography>
        <Typography>Tokens owned: {balance} </Typography>
        <TextField
          className="mt-4"
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
                  className="btn btn-default"
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
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn btn-default" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
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
          height="500"
        ></iframe>
      )}
    </Dialog>
  );
}
