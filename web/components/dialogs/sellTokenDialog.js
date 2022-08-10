import {
  Alert,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ethers } from 'ethers';
import TransactionFrame from '../utils/transactionFrame';
import { formatTokenBalance } from '/services/formatter';
import ResponsiveDialog from '../utils/responsiveDialog';

export default function SellTokenDialog(props) {
  const { open, setOpen, token, wunderPool, handleError, handleSuccess } =
    props;
  const {
    address,
    decimals,
    formattedBalance,
    name,
    symbol,
    dollarPrice,
    tradable,
  } = token;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <ResponsiveDialog open={open} onClose={handleClose} maxWidth="sm">
      <DialogTitle>Sell {name}</DialogTitle>
      <DialogContent className="min-h-10">
        {!tradable && (
          <Alert
            severity="warning"
            sx={{ marginBottom: 3, alignItems: 'center' }}
          >
            Trading this token is not recommended by Casama. Proceed at your own
            risk
          </Alert>
        )}
        <Typography>Price per token: {dollarPrice} $</Typography>
        <Typography>
          Tokens owned: {formatTokenBalance(formattedBalance)}{' '}
        </Typography>
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
      <TransactionFrame open={loading} />
    </ResponsiveDialog>
  );
}
