import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

export default function SellTokenDialog(props) {
  const { open, setOpen, token, wunderPool, handleError, handleSuccess } =
    props;
  const { address, decimals, formattedBalance, name, symbol } = token;
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
        ethers.utils.parseUnits(amount, decimals)
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
        setWaitingForPrice(false);
      });
    }
  }, [address]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>Sell {name}</DialogTitle>
      <DialogContent className="min-h-10">
        <Typography>Price per token: {tokenPrice} $</Typography>
        <Typography>Tokens owned: {formattedBalance} </Typography>
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
                  onClick={() => setAmount(formattedBalance)}
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
            disabled={Number(amount) > Number(formattedBalance)}
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
