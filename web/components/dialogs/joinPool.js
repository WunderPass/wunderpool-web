import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Divider,
} from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';
import { currency, usdc, polyValueToUsd } from '/services/formatter';
import CurrencyInput from '/components/utils/currencyInput';
import { BiCheck } from 'react-icons/bi';
import TransactionFrame from '/components/utils/transactionFrame';
import ResponsiveDialog from '../utils/responsiveDialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

export default function JoinPoolDialog(props) {
  const { open, loginCallback, handleSuccess, handleError, wunderPool, user } =
    props;
  const { minInvest, maxInvest } = wunderPool;
  const price = wunderPool.governanceToken?.price || 0;
  const totalSupply = wunderPool.governanceToken?.totalSupply || 0;

  const [amount, setAmount] = useState(minInvest || 3);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWallet, setIsWallet] = useState(true);
  const [isPayPal, setIsPayPal] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const handleOpenClose = () => {
    if (open) {
      setLoading(false);
      goBack(() => removeQueryParam('joinPool'));
    } else {
      addQueryParam({ joinPool: 'joinPool' }, false);
    }
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
    setTimeout(() => {
      wunderPool
        .join(amount)
        .then((res) => {
          user.fetchUsdBalance();
          handleSuccess(`Joined Pool with ${currency(amount)}`);
          handleOpenClose();
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        })
        .catch((err) => {
          handleError(err);
          setLoading(false);
        });
    }, 50);
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
    if (float && minInvest > float) {
      setErrorMsg(`Minimum of ${currency(minInvest)} required for the Pool`);
    } else if (float && maxInvest && float > maxInvest) {
      setErrorMsg(`Maximum Invest of ${currency(maxInvest)} surpassed`);
    } else if (user.usdBalance < float) {
      setErrorMsg(`Not enough balance`);
    } else {
      setErrorMsg(null);
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={open}
        onClose={handleOpenClose}
        maxWidth="sm"
        //disablePadding={loading}
      >
        <DialogTitle>Join - {wunderPool.poolName}</DialogTitle>
        <DialogContent
          sx={{
            height: loading ? '0px' : 'unset',
            paddingBottom: loading ? '0px' : 'unset',
            transition: 'height 300ms ease',
          }}
        >
          <DialogContentText className="text-sm pb-2">
            You will receive Governance Tokens proportionally to your invest
          </DialogContentText>

          <Divider className="mt-2 mb-4 opacity-70" />
          <Typography>Invest Amount</Typography>
          <CurrencyInput
            value={amount}
            placeholder={currency(minInvest)}
            onChange={handleInput}
            error={errorMsg}
          />
          <DialogContentText className="text-sm pt-2">
            <div className="flex flex-row justify-between items-center">
              <Typography>
                1 {wunderPool.governanceToken.symbol} ={' '}
                {currency(polyValueToUsd(price))}
              </Typography>
              <Typography>
                {wunderPool.governanceToken && currency(minInvest)} min
              </Typography>
            </div>
          </DialogContentText>
          <DialogContentText className="text-sm">
            <div className="flex flex-row justify-between items-center">
              <Typography>
                Estimated shares: {shareOfPool.toString()}%
              </Typography>
              {maxInvest && <Typography>{currency(maxInvest)} max</Typography>}
            </div>
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
            <div className="flex flex-row justify-between items-center w-full">
              <Typography className="ml-2"> WunderPass</Typography>
              <Typography className="ml-2 opacity-70">
                Balance: {currency(user.usdBalance)}
              </Typography>
            </div>
          </button>
          <button /*
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
            */
          ></button>
        </DialogContent>
        {loading ? (
          <>
            {' '}
            <TransactionFrame open={loading} />
          </>
        ) : (
          <DialogActions>
            <button
              className="btn-kaico w-full py-3 mx-3 mb-2"
              onClick={handleSubmit}
              disabled={!Boolean(amount) || Boolean(errorMsg) || !isWallet}
            >
              Join
            </button>
          </DialogActions>
        )}
      </ResponsiveDialog>
    </>
  );
}
