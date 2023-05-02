import {
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import MemberInput from '../members/input';
import { QrReader } from 'react-qr-reader';
import { MdOutlineQrCodeScanner } from 'react-icons/md';
import { transferUsdc } from '../../../services/contract/token';
import { currency } from '../../../services/formatter';
import { waitForTransaction } from '../../../services/contract/provider';
import axios from 'axios';
import { getNameFor } from '../../../services/memberHelpers';
import { UseUserType } from '../../../hooks/useUser';
import { UseNotification } from '../../../hooks/useNotification';
import { BsGearFill } from 'react-icons/bs';

type SendDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: UseUserType;
  handleError: UseNotification.handleError;
};
export default function SendDialog(props: SendDialogProps) {
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
  const [chain, setChain] = useState(user.preferredChain);
  const [anchorEl, setAnchorEl] = useState(null);

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
    transferUsdc(user.address, address, Number(amount), chain)
      .then((res) => {
        setWaitingForTx(true);
        setLoading(false);
        setTrx(res);
        axios({
          method: 'POST',
          url: '/api/users/notifyTransfer',
          data: {
            to: selectedUser?.email,
            firstName: selectedUser?.firstName || selectedUser?.handle,
            sender: getNameFor(user),
            amount: Number(amount),
            txHash: res,
          },
        })
          .then(console.log)
          .catch((err) => console.log(err));
        waitForTransaction(res, chain).then((tx) => {
          setWaitingForTx(false);
          setTrxSent(true);
          user.fetchUsdBalance(chain);
        });
      })
      .catch((err) => {
        handleError(err, user.wunderId, user.userName);
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
      address != selectedUser?.address && setSelectedUser(null);
      setIsAddressTouched(true);
      setIsAddressValid(addressRegex.test(address));
    }
  }, [address]);

  useEffect(() => {
    if (!selectedUser) return;
    setAddress(selectedUser?.address);
  }, [selectedUser]);

  useEffect(() => {
    if (!user.usdBalance) return;
    if (Number.isNaN(amount) || amount == '') {
      setIsAmountTouched(false);
      setIsAmountValid(false);
    } else {
      setIsAmountTouched(true);
      setIsAmountValid(
        Number(user.usdBalance) >= Number(amount) && Number(amount) >= 0.5
      );
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
        <DialogTitle className="w-full">
          Send USDC
          <button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            className="btn-default w-8 h-8 rounded-full flex items-center justify-center absolute right-4 top-4"
          >
            <BsGearFill className="w-5 h-5 text-casama-blue" />
          </button>
        </DialogTitle>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <p className="p-2 text-casama-blue">Select your Chain</p>
          <MenuItem
            selected={chain == 'gnosis'}
            onClick={() => {
              setChain('gnosis');
              setAnchorEl(null);
            }}
          >
            Gnosis
          </MenuItem>
          <MenuItem
            selected={chain == 'polygon'}
            onClick={() => {
              setChain('polygon');
              setAnchorEl(null);
            }}
          >
            Polygon
          </MenuItem>
        </Menu>
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
              <LinearProgress />
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
                    setAddress(result.getText());
                    setScanner(false);
                  }

                  if (!!error) {
                    console.info(error);
                  }
                }}
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
                placeholder="0"
                id="outlined-basic"
                label="Amount"
                variant="outlined"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">$</InputAdornment>
                  ),
                }}
              />
            </div>
            {isAmountTouched &&
              (Number(amount) >= 0.5 ? (
                !isAmountValid && (
                  <div className="block text-red-500">Insufficient Balance</div>
                )
              ) : (
                <div className="block text-red-500">
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
