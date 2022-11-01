import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import MemberInput from '/components/members/input';
import { QrReader } from 'react-qr-reader';
import { MdOutlineQrCodeScanner } from 'react-icons/md';
import { transferUsdc } from '/services/contract/token';
import { currency } from '/services/formatter';
import { waitForTransaction } from '../../services/contract/provider';

export default function SendDialog(props) {
  const { open, setOpen, user, handleError } = props;
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [isAddressTouched, setIsAddressTouched] = useState(false);
  const [isAmountTouched, setIsAmountTouched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scanner, setScanner] = useState(false);
  const [trx, setTrx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [trxSent, setTrxSent] = useState(false);

  const addressRegex = new RegExp('^0x[a-fA-F0-9]{40}$');

  const handleClose = () => {
    setSelectedUser(null);
    setTrx(null);
    setWaitingForTx(false);
    setScanner(false);
    setSelectedUser(null);
    setAddress('');
    setAmount('');
    setOpen(false);
    setLoading(false);
    setWaitingForTx(false);
    setTrxSent(false);
  };

  const sendFunds = () => {
    setLoading(true);
    transferUsdc(user.address, address, amount)
      .then((res) => {
        setWaitingForTx(true);
        setLoading(false);
        setTrx(res);
        waitForTransaction(res).then((tx) => {
          setWaitingForTx(false);
          setTrxSent(true);
          user.fetchUsdBalance();
        });
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (address === '') {
      setIsAddressTouched(false);
      setIsAddressValid(false);
    } else {
      setIsAddressTouched(true);
      setIsAddressValid(addressRegex.test(address));
    }
  }, [address]);

  useEffect(() => {
    if (!selectedUser) return;
    setAddress(selectedUser.address);
  }, [selectedUser]);

  useEffect(() => {
    if (!user.usdBalance) return;
    if (Number.isNaN(amount) || amount == '') {
      setIsAmountTouched(false);
      setIsAmountValid(false);
    } else {
      setIsAmountTouched(true);
      setIsAmountValid(parseInt(user.usdBalance) >= amount && amount >= 0.5);
    }
  }, [user.usdBalance, amount]);

  return (
    <>
      <Dialog
        PaperProps={{
          style: { borderRadius: 12 },
        }}
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle className="w-full">Send USDC</DialogTitle>
        {trxSent ? (
          <DialogContent>
            <div className="flex flex-col gap-3">
              <p className="text-gray-500">Your USDC has been sent!</p>
              <p className="text-gray-500">
                View your Transaction on{' '}
                <a
                  className="no-underline text-casama-blue"
                  target="_blank"
                  href={`https://polygonscan.com/tx/${trx}`}
                >
                  Polygonscan
                </a>
              </p>
            </div>
            <button
              onClick={() => handleClose()}
              className="btn-default w-full py-3 mt-3"
            >
              Done
            </button>
          </DialogContent>
        ) : waitingForTx ? (
          <DialogContent>
            <div className="flex flex-col gap-3">
              <LinearProgress color="casamaBlue" />
              <p className="text-gray-500">
                Your blockchain transaction has been initialized!
              </p>
              <p className="text-gray-500">
                Sending {currency(amount)}
                {selectedUser &&
                  ` to ${selectedUser.firstName} ${selectedUser.lastName}`}
              </p>
              <p className="text-gray-500">
                View your Transaction on{' '}
                <a
                  className="no-underline text-casama-blue"
                  target="_blank"
                  href={`https://polygonscan.com/tx/${trx}`}
                >
                  Polygonscan
                </a>
              </p>
            </div>
            <button
              onClick={() => handleClose()}
              className="btn-default w-full py-3 mt-3"
            >
              Done
            </button>
          </DialogContent>
        ) : (
          <DialogContent>
            {scanner && (
              <QrReader
                onResult={(result, error) => {
                  if (!!result) {
                    setAddress(result?.text);
                    setScanner(false);
                  }

                  if (!!error) {
                    console.info(error);
                  }
                }}
                style={{ width: '100%' }}
                constraints={{ facingMode: 'environment' }}
              />
            )}

            <div className="my-2 ">
              <TextField
                placeholder="0xac4c7c8c3a2cfffd889c1fb78b7468e281032284"
                className="w-full"
                id="outlined-basic"
                label="Receiving Address"
                variant="outlined"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <button onClick={() => setScanner(!scanner)}>
                      <MdOutlineQrCodeScanner className="text-4xl text-blue-500" />
                    </button>
                  ),
                }}
              />
            </div>
            {isAddressTouched && (
              <div
                className={isAddressValid ? 'hidden' : 'block text-red-500 '}
              >
                Address is invalid!
              </div>
            )}

            <div className="mb-2">
              <MemberInput
                user={user}
                selectedMembers={selectedUser}
                setSelectedMembers={setSelectedUser}
              />
            </div>
            <div className="">
              <TextField
                type="number"
                className="w-full"
                step="0.01"
                placeholder="0"
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">$</InputAdornment>
                  ),
                }}
              />
            </div>
            {isAmountTouched &&
              (amount >= 0.5 ? (
                !isAmountValid && (
                  <div className="block text-red-500 ">
                    Insufficient Balance
                  </div>
                )
              ) : (
                <div className={'block text-red-500 '}>
                  You cannot send less then $0.50!
                </div>
              ))}

            <button
              disabled={Boolean(!isAddressValid || !isAmountValid || loading)}
              onClick={() => sendFunds()}
              className="btn-casama w-full py-3 mt-3"
            >
              {loading ? 'Loading...' : 'Send'}
            </button>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
