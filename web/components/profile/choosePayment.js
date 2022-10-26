import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from '@mui/material';
import TopUpDialogPayPal from '/components/profile/topUpDialogPayPal';
import { useState, useEffect } from 'react';
import PaypalButton from '/components/payment/paypalButton';
import TransakLogo from '/assets/images/Transak/transak.png';
import Image from 'next/image';
import { BsApple } from 'react-icons/bs';
import { SiSepa } from 'react-icons/si';
import { RiVisaFill } from 'react-icons/ri';
import { SiMastercard } from 'react-icons/si';
import { FaGooglePay } from 'react-icons/fa';
import styles from '/styles/Image.module.css';

export default function (props) {
  const { open, setOpen, t, user, redirectAfterSuccess } = props;
  const [isApple, setIsApple] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  useEffect(() => {
    let userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.phoneNumber,
      dob: '-',
      address: {
        addressLine1: '-',
        addressLine2: '-',
        city: 'Berlin',
        state: '-',
        postCode: '10178',
        countryCode: 'GER',
      },
    };
    setUserData(userData);
  }, [user]);

  useEffect(() => {
    setIsApple(window.navigator.vendor.toLowerCase().match(/apple/));
  }, []);

  return (
    <>
      <Dialog
        PaperProps={{
          style: { borderRadius: 12 },
        }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{'cta.topUp.title'}</DialogTitle>
        <DialogContent>
          <DialogContentText>{'cta.topUp.subtitle'}</DialogContentText>
          <div className="flex flex-col items-center justify-center w-full py-2 ">
            <div className="container-wunder-blue p-4">
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
                  label={<SiSepa className="text-5xl text-white" />}
                />
                <Chip
                  className="items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<RiVisaFill className="text-4xl text-white" />}
                />
                <Chip
                  className="items-center p-2  my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<SiMastercard className="text-4xl text-white" />}
                />
                <Chip
                  className="items-center my-1  p-2 flex bg-casama-extra-light-blue text-casama-blue  mr-4"
                  size="medium"
                  label={<FaGooglePay className="text-5xl text-white" />}
                />
                <Chip
                  className={
                    isApple
                      ? 'items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-4'
                      : 'hidden'
                  }
                  size="medium"
                  label={<BsApple className="text-2xl text-white" />}
                />
              </div>
              {/* MOBILE VIEW */}
              <div className="sm:hidden flex flex-col items-center justify-between  my-5 ">
                <div className="flex flex-row items-center justify-between ">
                  <Chip
                    className=" p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  mr-5"
                    size="medium"
                    label={<RiVisaFill className="text-4xl text-white" />}
                  />
                  <Chip
                    className=" p-2  my-1 flex bg-casama-extra-light-blue text-casama-blue  "
                    size="medium"
                    label={<SiMastercard className="text-4xl text-white" />}
                  />
                </div>
                <div className="flex flex-row items-center justify-between ">
                  <Chip
                    className=" items-center my-1 p-2 flex bg-casama-extra-light-blue text-casama-blue mr-3 "
                    size="medium"
                    label={<FaGooglePay className="text-5xl text-white" />}
                  />
                  <Chip
                    className="items-center p-2 my-1 flex bg-casama-extra-light-blue text-casama-blue  "
                    size="medium"
                    label={<SiSepa className="text-5xl text-white" />}
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
                className="flex items-center justify-center btn-receive w-full my-2 h-12"
                //https://www.notion.so/Query-Parameters-9ec523df3b874ec58cef4fa3a906f238 = QUERY PARAMS
                // href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&network=polygon&cryptoCurrencyCode=USDC&walletAddress=${user.address}&defaultCryptoAmount=60&isAutoFillUserData=true&userData=${userData}redirectURL=https://app.wunderpass.org/balance`}
                href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&walletAddress=${user.address}&defaultCryptoAmount=60&isAutoFillUserData=true&userData=${userData}redirectURL=https://app.wunderpass.org/balance`}
                target="_blank"
              >
                <Image
                  src={TransakLogo}
                  alt="TransakLogo"
                  layout="intrinsic"
                  width={120}
                  height={35}
                />
              </a>
            </div>
            <div className="container-wunder-blue p-4 mt-5">
              <span className="font-bold">Buy </span>
              <span>
                your USDC for fiat money fast and easy directly with PayPal.{' '}
              </span>
              <button
                className="w-full my-2 mt-4"
                onClick={() => {
                  setTopUpOpen(true);
                  setOpen(false);
                }}
              >
                <PaypalButton loading={false} redirectUrl={true} {...props} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <TopUpDialogPayPal
        topUpOpen={topUpOpen}
        setTopUpOpen={setTopUpOpen}
        redirectAfterSuccess={'/balance'}
        {...props}
      />
    </>
  );
}
