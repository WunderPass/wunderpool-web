import { Typography } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import MetaMaskLogo from './metaMaskLogo';
import WalletConnectIcon from '/public/images/walletconnect.png';

export default function TransactionFrame({ open }) {
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
          Please Sign With your Wallet
        </Typography>
      </div>
    );
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
