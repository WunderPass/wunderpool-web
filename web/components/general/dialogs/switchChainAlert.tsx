import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import Image from 'next/image';
import { forwardRef } from 'react';
import { UseUserType } from '../../../hooks/useUser';
import { SupportedChain } from '../../../services/contract/types';
import { getMetamaskChainParams } from '../../../services/metamask';
import MetaMaskLogo from '../utils/metaMaskLogo';
import WalletConnectIcon from '/public/images/walletconnect.png';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SwitchChainAlert({ user }: { user: UseUserType }) {
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

  const switchChain = async (chain: SupportedChain) => {
    const chainParams = getMetamaskChainParams(chain);
    if (user.loginMethod == 'MetaMask') {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainParams.chainId }],
      });
    } else if (user.loginMethod == 'WalletConnect') {
      await (window as any).walletConnect.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainParams.chainId }],
      });
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      className="rounded-xl"
      open={
        unsupportedChain && ['WalletConect', 'MetaMask'].includes(loginMethod)
      }
      TransitionComponent={Transition}
    >
      <div className="flex justify-center mt-3">{renderTitleImage()}</div>
      <DialogTitle sx={{ textAlign: 'center' }}>Unsupported Chain</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Please Switch Chain to one of the supported chains
          </Alert>
          <button
            onClick={() => switchChain('polygon')}
            className="btn-casama px-3 py-2"
          >
            Switch to Polygon
          </button>
          <button
            onClick={() => switchChain('gnosis')}
            className="btn-casama px-3 py-2"
          >
            Switch to Gnosis
          </button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
