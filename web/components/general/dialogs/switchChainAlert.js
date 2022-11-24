import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from '@mui/material';
import Image from 'next/image';
import { forwardRef } from 'react';
import MetaMaskLogo from '/components/general/utils/metaMaskLogo';
import WalletConnectIcon from '/public/images/walletconnect.png';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SwitchChainAlert({ user }) {
  const { unsupportedChain, loginMethod } = user;

  const renderTitleImage = () => {
    if (loginMethod == 'MetaMask') {
      return <MetaMaskLogo width={100} height={90} />;
    } else if (loginMethod == 'WalletConnect') {
      return (
        <Image
          src={WalletConnectIcon}
          alt="walletconnect"
          layout="fixed"
          width={90}
          height={90}
        />
      );
    }
    return null;
  };

  const switchChain = async () => {
    if (user.loginMethod == 'MetaMask') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });
    } else if (user.loginMethod == 'WalletConnect') {
      await window.walletConnect.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      className="rounded-xl"
      open={unsupportedChain && loginMethod != 'WunderPass'}
      TransitionComponent={Transition}
    >
      <div className="flex justify-center mt-3">{renderTitleImage()}</div>
      <DialogTitle sx={{ textAlign: 'center' }}>Unsupported Chain</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Please Switch Chain to Polygon to Proceed
          </Alert>
          <button onClick={switchChain} className="btn-casama px-3 py-2">
            Switch Chain
          </button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
