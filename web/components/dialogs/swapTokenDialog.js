import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { fetchERC20Data } from '/services/contract/token';
import { createSwapSuggestion } from '/services/contract/proposals';
import TokenInput from '../tokens/input';

export default function SwapTokenDialog(props) {
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
    createSwapSuggestion(
      poolAddress,
      address,
      receiveAddress,
      `Let's Swap ${name} (${symbol}) for ${receiveName} (${receiveSymbol})`,
      `We will swap ${amount} ${symbol} for ${receiveSymbol}`,
      amount
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Proposal to Swap ${name}`);
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
    const addr = e.target.value;
    setReceiveAddress(addr);
    if (addr.length == 42) {
      fetchERC20Data(addr).then((res) => {
        setReceiveName(res.name);
        setReceiveSymbol(res.symbol);
      });
    } else {
      setTokenName(null);
      setTokenSymbol(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>Swap {name}</DialogTitle>
      <DialogContent>
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
                    onClick={() => setAmount(balance)}
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
              Number(amount) > Number(balance) || receiveName.length < 1
            }
          >
            Swap
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
