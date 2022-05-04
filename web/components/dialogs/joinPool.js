import {
  Button,
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
import { toEthString } from '/services/formatter';
import { joinPool } from '/services/contract/pools';
import { usdc } from '../../services/formatter';

export default function JoinPoolDialog(props) {
  const {
    open,
    setOpen,
    loginCallback,
    address,
    handleSuccess,
    handleError,
    price,
    totalSupply,
    minimumInvest,
  } = props;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount('');
    setOpen(false);
    setLoading(false);
  };

  const smartContractTransaction = (tx, usdc = {}, network = 'polygon') => {
    return new Promise(async (resolve, reject) => {
      try {
        const popup = window.open(
          encodeURI(
            `${process.env.WUNDERPASS_URL}/smartContract?name=${name}&imageUrl=${image}`
          ),
          'myFrame',
          'directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=no,resizable=no,width=400,height=350'
        );
        setTimeout = (() => {}, 1000);

        const requestInterval = setInterval(() => {
          popup.postMessage(
            JSON.parse(
              JSON.stringify({
                accountId: accountId,
                tx: tx,
                network: network,
                usdc: usdc,
              })
            ),
            process.env.WUNDERPASS_URL
          );
        }, 1000);

        window.addEventListener('message', (event) => {
          if (event.origin == process.env.WUNDERPASS_URL) {
            clearInterval(requestInterval);

            if (event.data && typeof event.data == 'object') {
              event.source.window.close();
              resolve(event.data.response);
            }
          }
        });
      } catch (error) {
        reject(error?.error?.error?.error?.message || error);
      }
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    joinPool(address, amount)
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

  const receivedTokens = ethers.BigNumber.from(usdc(amount)).div(price);
  const shareOfPool = receivedTokens
    .mul(100)
    .div(totalSupply.add(receivedTokens));

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
          <button className="btn-default btn-red" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-default btn-green"
            onClick={handleSubmit}
            disabled={minimumInvest.gt(usdc(amount))}
          >
            Join
          </button>
        </DialogActions>
      )}
      {loading && (
        <iframe id="fr" name="transactionFrame" width="600" height="600">
          {' '}
        </iframe>
      )}
    </Dialog>
  );
}
