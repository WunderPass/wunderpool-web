import {
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Dispatch, SetStateAction, useState } from 'react';
import { waitForTransaction } from '../../../services/contract/provider';
import axios from 'axios';
import { getNameFor } from '../../../services/memberHelpers';
import { approveUSDC } from '../../../services/contract/token';
import CurrencyInput from '../utils/currencyInput';
import { toFixed, currency } from '../../../services/formatter';
import { FaCcPaypal } from 'react-icons/fa';
import { SiSepa } from 'react-icons/si';
import { UseUserType } from '../../../hooks/useUser';
import { UseNotification } from '../../../hooks/useNotification';

type RampOffDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function RampOffDialog(props: RampOffDialogProps) {
  const { open, setOpen, user, handleError } = props;
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);
  const [payoutMethod, setPayoutMethod] = useState('PayPal');
  const [payoutIdentifier, setPayoutIdentifier] = useState('');

  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);

  const handleSubmit = async () => {
    if (Number(amount) > user.usdBalance) {
      handleError('Insufficient Funds', user.wunderId, user.userName);
      return;
    }
    setLoading(true);
    try {
      const txHash = await approveUSDC(
        user.address,
        '0xD7720A41460f0B1a04F9e78edAc7A75F5bf4DC28',
        Number(amount),
        user.preferredChain
      );
      setTransactionHash(txHash);
      await waitForTransaction(txHash, user.preferredChain);
      await axios({
        method: 'post',
        url: '/api/discord/rampOff',
        data: {
          userName: getNameFor(user),
          address: user.address,
          amount,
          payoutMethod,
          payoutIdentifier,
          txHash,
        },
      });
    } catch (error) {
      handleError(error, user.wunderId, user.userName);
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog
        PaperProps={{
          style: { borderRadius: 12 },
        }}
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <div className="flex items-center justify-between px-5 pt-3">
          <h1 className="text-xl">Withdraw USDC</h1>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        {loading ? (
          <DialogContent>
            <div className="flex flex-col gap-3">
              <LinearProgress />
              <p className="text-gray-500">
                Your blockchain transaction has been initialized!
              </p>
            </div>
          </DialogContent>
        ) : transactionHash ? (
          <DialogContent>
            <div className="flex flex-col gap-3">
              <p className="text-gray-500">
                The Casama Team has been notified about your withdrawl. We will
                process your request as soon as possible.
              </p>
              <p className="text-gray-500">
                In case anything goes wrong, please get in touch with us. You
                should also write down the following Transaction Receipt as a
                proof of your transaction:
              </p>
              <p className="text-casama-blue">{transactionHash}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="btn-default w-full py-3 mt-3"
            >
              Done
            </button>
          </DialogContent>
        ) : (
          <DialogContent>
            <div className="flex flex-col gap-3">
              <div>
                <label>Amount</label>
                <CurrencyInput
                  value={amount}
                  placeholder={currency(user.usdBalance)}
                  limit={toFixed(user.usdBalance, 2)}
                  onChange={(val, num) => {
                    setAmountError(num > 50 ? null : 'Must be at least $50');
                    setAmount(val);
                  }}
                  error={amountError}
                />
              </div>
              <FormControl>
                <FormLabel
                  id="demo-controlled-radio-buttons-group"
                  className="text-black"
                >
                  Payout Method
                </FormLabel>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  row
                  value={payoutMethod}
                  onChange={(_, v) => {
                    setPayoutIdentifier('');
                    setPayoutMethod(v);
                  }}
                >
                  <FormControlLabel
                    value="PayPal"
                    control={<Radio />}
                    label={<FaCcPaypal className="text-3xl text-blue-800" />}
                  />
                  <FormControlLabel
                    value="Sepa"
                    control={<Radio />}
                    label={<SiSepa className="text-6xl text-casama-blue" />}
                  />
                </RadioGroup>
              </FormControl>
              <div>
                <label>
                  {payoutMethod == 'PayPal'
                    ? 'PayPal Username or Email'
                    : 'IBAN'}
                </label>
                <input
                  className="textfield py-4 px-3 mt-3"
                  value={payoutIdentifier}
                  onChange={(e) => setPayoutIdentifier(e.target.value)}
                  placeholder={
                    payoutMethod == 'PayPal'
                      ? 'PayPal Username or Email'
                      : 'IBAN'
                  }
                />
              </div>
              <button
                disabled={
                  !payoutMethod ||
                  !payoutIdentifier ||
                  !amount ||
                  Number(amount) > user.usdBalance ||
                  Number(amount) < 50 ||
                  loading
                }
                onClick={handleSubmit}
                className="btn-casama w-full py-3 mt-3"
              >
                Send Withdrawl Request
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
