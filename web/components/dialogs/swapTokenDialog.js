import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import TokenInput from '../tokens/input';
import TransactionFrame from '../utils/transactionFrame';
import { ethers } from 'ethers';

export default function SwapTokenDialog(props) {
  const { open, setOpen, token, wunderPool, handleError, handleSuccess } =
    props;
  const { address, decimals, formattedBalance, name, symbol, tradable } = token;
  const [amount, setAmount] = useState('');
  const [receiveName, setReceiveName] = useState('');
  const [receiveSymbol, setReceiveSymbol] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  const [receiveImage, setReceiveImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount('');
    setReceiveName('');
    setReceiveSymbol('');
    setReceiveAddress('');
    setLoading(false);
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    wunderPool
      .swapSuggestion(
        address,
        receiveAddress,
        `Let's Swap ${name} (${symbol}) for ${receiveName} (${receiveSymbol})`,
        `We will swap ${amount} ${symbol} for ${receiveSymbol}`,
        ethers.utils.parseUnits(amount, decimals)
      )
      .then((res) => {
        handleSuccess(`Created Proposal to Swap ${name}`);
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

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <DialogTitle>Swap {name}</DialogTitle>
      <DialogContent>
        {!tradable && (
          <Alert
            severity="warning"
            sx={{ marginBottom: 3, alignItems: 'center' }}
          >
            Trading this token is not recommended by Casama. Proceed at your own
            risk
          </Alert>
        )}
        <Stack spacing={2}>
          <TextField
            autoFocus
            type="number"
            margin="dense"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
          <DialogContentText>For</DialogContentText>
          <TokenInput
            setTokenAddress={setReceiveAddress}
            setTokenName={setReceiveName}
            setTokenSymbol={setReceiveSymbol}
            setTokenImage={setReceiveImage}
          />
          {receiveName && (
            <Stack
              spacing={2}
              alignItems="center"
              direction="row"
              sx={{ height: '50px' }}
            >
              <img width="50px" src={receiveImage || '/favicon.ico'} />
              <Typography variant="h6">
                {receiveName} ({receiveSymbol})
              </Typography>
            </Stack>
          )}
        </Stack>
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
            disabled={
              Number(amount) > Number(formattedBalance) ||
              receiveName.length < 1
            }
          >
            Swap
          </button>
        </DialogActions>
      )}
      <TransactionFrame open={loading} />
    </Dialog>
  );
}
