import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Checkbox,
  Typography,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  forwardRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import { BsApple } from 'react-icons/bs';
import { SiSepa } from 'react-icons/si';
import { RiVisaFill } from 'react-icons/ri';
import { SiMastercard } from 'react-icons/si';
import { FaGooglePay } from 'react-icons/fa';
import PayPalButton from '../utils/payPalButton';
import { useRouter } from 'next/router';
import { AiFillCloseCircle } from 'react-icons/ai';
import { transakRampOnLink } from '../../../services/transak';
import { TransitionProps } from '@mui/material/transitions';
import { UseUserType } from '../../../hooks/useUser';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type TopUpAlertProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: UseUserType;
};

export default function TopUpAlert(props: TopUpAlertProps) {
  const { open, setOpen, user } = props;
  const [isApple, setIsApple] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [amount, setAmount] = useState(null);
  const [checked, setChecked] = useState(null);

  const router = useRouter();

  useEffect(() => {
    setIsApple(Boolean(window.navigator.vendor.toLowerCase().match(/apple/)));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setShowAlert(
      !['/balance/topUp/success', '/onboarding'].includes(router.pathname)
    );
  }, [router.isReady, router.pathname]);

  const handleClose = () => {
    user.updateCheckedTopUp(user.checkedTopUp || checked);
    setOpen(false);
  };

  useEffect(() => {
    if (open) setRedirectUrl(new URL(document.URL));
  }, [open]);

  useEffect(() => {
    if (open) setRedirectUrl(new URL(document.URL));
  }, [open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      className="rounded-xl"
      open={Boolean(open && showAlert)}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <div className="flex justify-end ">
          <button onClick={() => handleClose()}>
            <AiFillCloseCircle />
          </button>
        </div>{' '}
        <div>Manage Funds</div>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="w-full">
          <p>
            The main currency on Casama is USDC on the Polygon Chain. To create
            or join Pools you need to have USDC in your Wallet.
          </p>
          <div className="container-gray flex flex-col gap-3">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-around"
              gap={1}
              flexWrap="wrap"
            >
              {[5, 10, 50].map((val, i) => {
                return (
                  <button
                    className="btn-casama py-2 px-3 flex-grow"
                    key={`top-up-button-${i}`}
                    onClick={() => {
                      setAmount(`${val}`);
                    }}
                  >{`${val}€`}</button>
                );
              })}
            </Stack>
            <TextField
              autoFocus
              type="number"
              margin="dense"
              value={amount}
              onChange={(e) =>
                setAmount(
                  Math.max(0, Math.min(50, Number(e.target.value))) || ''
                )
              }
              placeholder="Custom Amount"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">$</InputAdornment>,
              }}
            />
            <PayPalButton amount={amount} {...props} />
          </div>
          <div className="container-casama">
            <p>
              <b>Buy</b> or <b>Sell</b> your USDC for fiat money directly with
              Transak. Supports SEPA, Visa, Mastercard, ApplePay and GooglePay.
            </p>
            <div className="flex flex-row items-center justify-center flex-wrap gap-3 my-5">
              <Chip
                className="bg-casama-extra-light-blue text-casama-blue"
                size="medium"
                label={<SiSepa className="text-5xl" />}
              />
              <Chip
                className="bg-casama-extra-light-blue text-casama-blue"
                size="medium"
                label={<RiVisaFill className="text-4xl" />}
              />
              <Chip
                className="items-center p-2  my-1 flex bg-casama-extra-light-blue text-casama-blue"
                size="medium"
                label={<SiMastercard className="text-4xl" />}
              />
              <Chip
                className="items-center my-1  p-2 flex bg-casama-extra-light-blue text-casama-blue"
                size="medium"
                label={<FaGooglePay className="text-5xl" />}
              />
              <Chip
                className={
                  isApple
                    ? 'bg-casama-extra-light-blue text-casama-blue'
                    : 'hidden'
                }
                size="medium"
                label={<BsApple className="text-2xl" />}
              />
            </div>
            <a
              //https://www.notion.so/Query-Parameters-9ec523df3b874ec58cef4fa3a906f238 = QUERY PARAMS
              href={transakRampOnLink({ address: user.address, amount: 50 })}
              target="_blank"
            >
              <button className="btn-casama-white p-2 w-full">
                Use Transak
              </button>
            </a>
          </div>

          {user.usdBalance < 1 && !user.checkedTopUp && (
            <div className="flex flex-row justify-start items-center mt-2">
              <Checkbox
                checked={checked}
                onChange={() => setChecked((chkd) => !chkd)}
              />
              <Typography className="pt-1">
                Don't show this info again.
              </Typography>
            </div>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
