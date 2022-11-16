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
import { forwardRef, useState, useEffect } from 'react';
import { BsApple } from 'react-icons/bs';
import { SiSepa } from 'react-icons/si';
import { RiVisaFill } from 'react-icons/ri';
import { SiMastercard } from 'react-icons/si';
import { FaGooglePay } from 'react-icons/fa';
import PayPalButton from '../utils/payPalButton';
import { useRouter } from 'next/router';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TopUpAlert(props) {
  const { open, setOpen, user } = props;
  const [isApple, setIsApple] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [amount, setAmount] = useState(null);
  const [checked, setChecked] = useState(null);

  const router = useRouter();
  // const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   let userData = {
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email,
  //     mobileNumber: user.phoneNumber,
  //     dob: '-',
  //     address: {
  //       addressLine1: '-',
  //       addressLine2: '-',
  //       city: 'Berlin',
  //       state: '-',
  //       postCode: '10178',
  //       countryCode: 'GER',
  //     },
  //   };
  //   setUserData(userData);
  // }, [user]);

  useEffect(() => {
    setIsApple(window.navigator.vendor.toLowerCase().match(/apple/));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setShowAlert(
      !['/balance', '/balance/topUp/success'].includes(router.pathname)
    );
  }, [router.isReady]);

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
      <DialogTitle sx={{ textAlign: 'center' }}>Manage Funds</DialogTitle>
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
              {[5, 10, 50, 100].map((val, i) => {
                return (
                  <button
                    className="btn-casama py-2 px-3 flex-grow"
                    key={`top-up-button-${i}`}
                    variant="contained"
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
              onChange={(e) => setAmount(e.target.value)}
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
              // href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&cryptoCurrencyCode=USDC&defaultNetwork=polygon&walletAddress=${user.address}&redirectURL=https://app.casama.io/pools`}
              href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&walletAddress=${user.address}&redirectURL=https://app.casama.io/betting`}
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
