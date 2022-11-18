import { LinearProgress, Typography } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import MetaMaskLogo from './metaMaskLogo';
import WalletConnectIcon from '/public/images/walletconnect.png';

function CasamaLoading({ open, text = null }) {
  const [step, setStep] = useState(0);

  const steps = [
    'Writing your Transaction on the Blockchain',
    'Building the Blocks',
    'Waiting for Confirmation',
    'We are almost there. Please be Patient',
  ];

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setStep((s) => (s == steps.length - 1 ? s : s + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <div
      className="w-full flex-grow overflow-hidden pb-3"
      style={{
        transition: 'max-height 300ms ease',
        maxHeight: open ? '500px' : '0px',
      }}
    >
      <div className="m-4">
        <LinearProgress color="casamaBlue" />
      </div>
      <Typography variant="h6" textAlign="center">
        {text || 'Processing Transaction...'}
      </Typography>
      <p className="text-casama-blue text-center">{steps[step]}</p>
    </div>
  );
}

export default function TransactionFrame({ open, text = null }) {
  const [isSafari, setIsSafari] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [loginMethod, setLoginMethod] = useState(false);

  useEffect(() => {
    setIsSafari(
      window.navigator.userAgent.toLowerCase().match(/safari/) &&
        window.navigator.vendor.toLowerCase().match(/apple/)
    );
    setIsApple(window.navigator.vendor.toLowerCase().match(/apple/));
    setLoginMethod(localStorage.getItem('loginMethod'));
  }, []);

  const renderTitleImage = () => {
    if (loginMethod == 'MetaMask') {
      return <MetaMaskLogo width={150} height={140} />;
    } else if (loginMethod == 'WalletConnect') {
      return (
        <Image
          src={WalletConnectIcon}
          alt="walletconnect"
          layout="fixed"
          width={100}
          height={100}
        />
      );
    }
    return null;
  };

  if (['MetaMask', 'WalletConnect'].includes(loginMethod)) {
    return (
      <div
        className="w-full flex-grow overflow-hidden pb-3"
        style={{
          transition: 'max-height 300ms ease',
          maxHeight: open ? '500px' : '0px',
        }}
      >
        <div className="flex justify-center my-4">{renderTitleImage()}</div>
        <Typography variant="h6" textAlign="center">
          {text || 'Please Sign With your Wallet'}
        </Typography>
      </div>
    );
  }

  if (loginMethod == 'Casama') {
    return <CasamaLoading text={text} open={open} />;
  }

  return (
    <iframe
      className="w-full flex-grow"
      id="fr"
      name="transactionFrame"
      style={{
        transition: 'max-height 300ms ease',
        maxHeight: !isSafari && open ? 'unset' : '0',
        height: !isSafari && open ? '500px' : '0',
      }}
    ></iframe>
  );
}
