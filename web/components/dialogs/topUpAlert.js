import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Checkbox,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { forwardRef, useState, useEffect } from 'react';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TopUpAlert(props) {
  const { open, setOpen, user } = props;
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [checked, setChecked] = useState(null);

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
        <Stack spacing={2}>
          <Alert severity={user.usdBalance > 1 ? 'info' : 'warning'}>
            You will receive the digital currency USD Coin (USDC) in your wallet
            at current market rates in exchange for depositing fiat (USD or
            EUR).
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
      </DialogContent>
    </Dialog>
  );
}
