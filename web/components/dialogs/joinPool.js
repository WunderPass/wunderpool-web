import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';
import { toEthString, usdc } from '/services/formatter';
import CurrencyInput from '/components/utils/currencyInput';
import { currency, polyValueToUsd } from '/services/formatter';
import { BiCheck } from 'react-icons/bi';

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
  const [amount, setAmount] = useState(
    polyValueToUsd(wunderPool.governanceToken.entryBarrier, {})
  );
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWallet, setIsWallet] = useState(false);
  const [isPayPal, setIsPayPal] = useState(false);

  const handleClose = () => {
    console.log(wunderPool);

    setOpen(false);
    setLoading(false);
  };

  const chooseWallet = () => {
    setIsWallet(true);
    setIsPayPal(false);
  };

  const choosePayPal = () => {
    setIsWallet(false);
    setIsPayPal(true);
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
        <DialogTitle>Join - {wunderPool.poolName}</DialogTitle>
        <DialogContent>
          <div>
            <DialogContentText className="text-sm pb-3">
              You will receive Governance Tokens proportionally to your invest
            </DialogContentText>

            <DialogContentText className="flex flex-col my-3 ">
              <Typography>Criteria:</Typography>
              <div className="flex flex-row">
                <Typography className="text-black pr-2">
                  {wunderPool.governanceToken &&
                    currency(
                      polyValueToUsd(
                        wunderPool.governanceToken.entryBarrier,
                        {}
                      ),
                      {}
                    )}
                </Typography>
                <Typography>min</Typography>
              </div>
              <div className="flex flex-row">
                <Typography className="text-black pr-2">
                  {wunderPool.governanceToken &&
                    currency(
                      polyValueToUsd(wunderPool.governanceToken.maxInvest, {}),
                      {}
                    )}
                </Typography>
                <Typography>max</Typography>
              </div>
            </DialogContentText>
            <Divider className="my-6 opacity-70" />
            <Typography>Invest Amount</Typography>
            <CurrencyInput
              value={amount}
              placeholder={currency(
                polyValueToUsd(wunderPool.governanceToken.entryBarrier, {}),
                {}
              )}
              onChange={handleInput}
              error={errorMsg}
            />
            <DialogContentText className="text-sm pt-2">
              1 {wunderPool.governanceToken.symbol} ={' '}
              {currency(polyValueToUsd(price, {}), {})}
            </DialogContentText>
            <DialogContentText className="text-sm">
              Estimated shares: {shareOfPool.toString()}%
            </DialogContentText>
            <Divider className="my-6 opacity-70" />
            <Typography>Choose payment method</Typography>

            <button
              className={
                isWallet
                  ? 'border-2 border-kaico-blue container-checkbox flex flex-row items-center py-4 mt-2 z-2'
                  : 'border container-checkbox flex flex-row items-center py-4 mt-2 z-2'
              }
              onClick={chooseWallet}
            >
              <button
                onClick={chooseWallet}
                className={
                  isWallet
                    ? 'bg-kaico-blue border-kaico-blue rounded-md border'
                    : 'border border-gray-300  rounded-md'
                }
              >
                <BiCheck className="text-gray-100 text-lg" />
              </button>
              <Typography className="ml-2"> WunderPass</Typography>
            </button>
            <button
              className={
                isPayPal
                  ? 'border-2 border-kaico-blue container-checkbox flex flex-row items-center py-4 mt-2 z-2'
                  : 'border container-checkbox flex flex-row items-center py-4 mt-2 z-2'
              }
              onClick={choosePayPal}
            >
              <div
                className={
                  isPayPal
                    ? 'border bg-kaico-blue border-kaico-blue  rounded-md '
                    : 'border border-gray-300  rounded-md'
                }
              >
                <BiCheck className="text-gray-100 text-lg" />
              </div>
              <Typography className="ml-2"> PayPal</Typography>
            </button>
          </div>
        </DialogContent>
        {loading ? (
          <></>
        ) : (
          <DialogActions>
            <button
              className="btn-kaico w-full py-3 mx-3 mb-2"
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
