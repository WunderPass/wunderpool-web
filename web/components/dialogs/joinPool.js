import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';
import { toEthString, usdc } from '/services/formatter';
import CurrencyInput from '/components/utils/currencyInput';

export default function JoinPoolDialog(props) {
  const {
    open,
    setOpen,
    loginCallback,
    handleSuccess,
    handleError,
    wunderPool,
    user,
  } = props;
  const { price, totalSupply, entryBarrier } = wunderPool.governanceToken;
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
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
        user.fetchUsdBalance();
        //handleSuccess(`Joined Pool with ${amount} USD`);
        loginCallback();
        //handleClose();
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
      ? receivedTokens.mul(100).div(totalSupply.add(receivedTokens))
      : ethers.BigNumber.from(100);

  const handleInput = (value, float) => {
    setAmount(value);
    if (float && entryBarrier.gt(float * 1000000)) {
      setErrorMsg(
        `Minimum of ${entryBarrier
          .div(1000000)
          .toString()} $ required for the Pool`
      );
    } else if (float && 0 > float) {
      setErrorMsg(`Minimum of 3 $ required`);
    } else if (user.usdBalance < float) {
      setErrorMsg(`Not enough balance`);
    } else {
      setErrorMsg(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { borderRadius: 12 },
        }}
      >
        <DialogTitle>Join the Pool</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will receive Governance Tokens proportionally to your invest
          </DialogContentText>
          <DialogContentText>
            Price per Governance Token: {toEthString(price, 6)} USD
          </DialogContentText>
          <CurrencyInput
            value={amount}
            placeholder="Invest Amount"
            onChange={handleInput}
            error={errorMsg}
          />
          <DialogContentText>
            Share of Pool: {shareOfPool.toString()}%
          </DialogContentText>
        </DialogContent>
        {loading ? (
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1">Joining Pool...</Typography>
          </Stack>
        ) : (
          <DialogActions>
            <button className="btn btn-danger" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={!Boolean(amount) || Boolean(errorMsg)}
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
            height="500"
            style={{ transition: 'height 300ms ease' }}
          ></iframe>
        )}
      </Dialog>
    </>
  );
}
