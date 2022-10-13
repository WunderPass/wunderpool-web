import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Checkbox,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { forwardRef, useState, useEffect } from 'react';
import CreateYourWunderPass from '../auth/createYourWunderPass';
import { BsApple } from 'react-icons/bs';
import { SiSepa } from 'react-icons/si';
import { RiVisaFill } from 'react-icons/ri';
import { SiMastercard } from 'react-icons/si';
import { FaGooglePay } from 'react-icons/fa';
import { FaCcPaypal } from 'react-icons/fa';
import TransakLogo from '/public/transak.png';
import Image from 'next/image';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TopUpAlert(props) {
  const { open, setOpen, user } = props;
  const [isApple, setIsApple] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [checked, setChecked] = useState(null);

  useEffect(() => {
    setIsApple(window.navigator.vendor.toLowerCase().match(/apple/));
  }, []);

  const handleSuccess = ({ wunderId, address, loginMethod }) => {
    user.updateLoginMethod(loginMethod);
    user.updateWunderId(wunderId);
    user.updateAddress(address);
  };

  const handleClose = () => {
    user.updateCheckedTopUp(user.checkedTopUp || checked);
    setOpen(false);
  };

  useEffect(() => {
    if (open) setRedirectUrl(new URL(document.URL));
  }, [open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      className="rounded-xl"
      open={open || false}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Manage Funds</DialogTitle>
      <DialogContent>
        {user.loginMethod == 'WunderPass' ? (
          <Stack spacing={4} className="flex w-full ">
            <div className="container-casama">
              <span className="font-bold">Buy </span>
              <span className="">or </span>
              <span className="font-bold">Sell </span>
              <span>
                your USDC for fiat money directly with Transak. Supports SEPA,
                Visa, Mastercard, ApplePay and GooglePay.
              </span>
              {/* DESKTOP VIEW  */}
              <div className="hidden sm:flex flex-row items-center justify-center my-5 ">
                <Chip
                  className="items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<SiSepa className="text-5xl" />}
                />
                <Chip
                  className="items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<RiVisaFill className="text-4xl" />}
                />
                <Chip
                  className="items-center p-2  my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<SiMastercard className="text-4xl" />}
                />
                <Chip
                  className="items-center my-1  p-2 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<FaGooglePay className="text-5xl" />}
                />
                <Chip
                  className={
                    isApple
                      ? 'items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4'
                      : 'hidden'
                  }
                  size="medium"
                  label={<BsApple className="text-2xl" />}
                />
              </div>
              {/* MOBILE VIEW */}
              <div className="sm:hidden flex flex-col items-center justify-between  my-5 ">
                <div className="flex flex-row items-center justify-between ">
                  <Chip
                    className=" p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-5"
                    size="medium"
                    label={<RiVisaFill className="text-4xl" />}
                  />
                  <Chip
                    className=" p-2  my-1 flex bg-casama-extra-light-blue text-casama-blue  "
                    size="medium"
                    label={<SiMastercard className="text-4xl" />}
                  />
                </div>
                <div className="flex flex-row items-center justify-between ">
                  <Chip
                    className=" items-center my-1 p-2 flex bg-casama-extra-light-blue text-casama-blue mr-3 "
                    size="medium"
                    label={<FaGooglePay className="text-5xl" />}
                  />
                  <Chip
                    className="items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  "
                    size="medium"
                    label={<SiSepa className="text-5xl" />}
                  />
                </div>
                <div className="flex flex-row">
                  <Chip
                    className={
                      isApple
                        ? 'items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4'
                        : 'hidden'
                    }
                    size="medium"
                    label={<BsApple className="text-2xl" />}
                  />
                </div>
              </div>
              <a
                href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}`}
                target="_blank"
              >
                <button className="btn-casama-white p-2 w-full">
                  Use Transak
                </button>
              </a>
            </div>

            <div className="container-casama">
              Manage your wallet in WunderPass and decide which provider you
              want to use there.
              <div className="flex flex-row items-center justify-between sm:justify-center my-5 ">
                <Chip
                  className="items-center p-2 my-1 sm:flex bg-casama-extra-light-blue text-casama-blue  sm:mr-5"
                  size="medium"
                  label={<FaCcPaypal className="text-3xl" />}
                />
                <Chip
                  className="items-center  sm:flex bg-casama-extra-light-blue text-casama-blue  "
                  size="medium"
                  label={
                    <div className="pt-1.5">
                      <Image
                        src={TransakLogo}
                        alt="TransakLogo"
                        layout="intrinsic"
                        width={100}
                        height={30}
                      />
                    </div>
                  }
                />
              </div>
              <a
                className="flex w-full "
                href={`${process.env.WUNDERPASS_URL}/balance/topUp?redirectUrl=${redirectUrl}`}
                target="_blank"
              >
                <button className="btn-casama-white p-2 w-full">
                  Go to WunderPass
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
        ) : (
          <Stack spacing={2}>
            <Alert severity={user.usdBalance > 1 ? 'info' : 'warning'}>
              The main currency on Casama is USDC on the Polygon Chain. To
              create or join Pools you need to have USDC in your Wallet.
            </Alert>
            <Divider />
            <Typography textAlign="center">
              Or use Casama with WunderPass to pay with PayPal and get $10 for
              free
            </Typography>
            <CreateYourWunderPass
              text="Login With WunderPass"
              name="Casama"
              redirect={'pools'}
              intent={['wunderId', 'address']}
              onSuccess={handleSuccess}
            />
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
        )}
      </DialogContent>
    </Dialog>
  );
}
