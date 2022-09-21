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
} from '@mui/material';
import Link from 'next/link';
import { forwardRef, useState, useEffect } from 'react';
import CreateYourWunderPass from '../auth/createYourWunderPass';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TopUpAlert(props) {
  const { open, setOpen, user } = props;
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [checked, setChecked] = useState(null);

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
      <DialogTitle sx={{ textAlign: 'center' }}>Deposit Funds</DialogTitle>
      <DialogContent>
        {user.loginMethod == 'WunderPass' ? (
          <Stack spacing={2}>
            <Alert severity={user.usdBalance > 1 ? 'info' : 'warning'}>
              You will receive the digital currency USD Coin (USDC) in your
              wallet at current market rates in exchange for depositing fiat
              (USD or EUR).
            </Alert>
            <Link
              href={`${process.env.WUNDERPASS_URL}/balance/topUp?redirectUrl=${redirectUrl}`}
            >
              <button className="btn btn-info">Select a Payment Method</button>
            </Link>
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
