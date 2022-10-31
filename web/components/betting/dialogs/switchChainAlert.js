import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Slide,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { forwardRef } from 'react';
import CreateYourWunderPass from '/components/general/auth/createYourWunderPass';
import MetaMaskLogo from '/components/general/utils/metaMaskLogo';
import WalletConnectIcon from '/public/images/walletconnect.png';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SwitchChainAlert({ user }) {
  const { unsupportedChain, loginMethod } = user;

  const handleSuccess = ({ wunderId, address, loginMethod }) => {
    user.updateLoginMethod(loginMethod);
    user.updateWunderId(wunderId);
    user.updateAddress(address);
  };

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
          <Divider />
          <Typography textAlign="center">
            Or use Casama with WunderPass to avoid these kind of issues
          </Typography>
          <CreateYourWunderPass
            text="Login With WunderPass"
            name="Casama"
            redirect={'pools'}
            intent={['wunderId', 'address']}
            onSuccess={handleSuccess}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
