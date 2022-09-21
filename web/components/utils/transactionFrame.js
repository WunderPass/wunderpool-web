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
          width={150}
          height={150}
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
          overflow: 'hidden',
          maxHeight: open ? '500px' : '0px',
        }}
      >
        <div className="flex justify-center mt-3">{renderTitleImage()}</div>
        <Typography textAlign="center">Please Sign With your Wallet</Typography>
      </div>
    );
  }

  return (
    <iframe
      className="w-full flex-grow"
      id="fr"
      name="transactionFrame"
      height={!isSafari && open ? '500' : '0'}
      style={{ transition: 'height 300ms ease' }}
    ></iframe>
  );
}
