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
  const [checked, setChecked] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = () => {
    setChecked(!checked);
  };

  useEffect(() => {
    if (open) {
      setRedirectUrl(new URL(document.URL));
    }
    localStorage.setItem('checkedTopUp', checked);
  }, [open]);

  return (
    <Dialog
      open={open || false}
      onClose={handleClose}
      TransitionComponent={Transition}
      fullWidth
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        {user.usdBalance > 1 ? 'TopUp your Account' : 'TopUp Required'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity={user.usdBalance > 1 ? 'info' : 'warning'}>
            {user.usdBalance > 1
              ? 'Click here to top up your account'
              : 'In order to use WunderPool, please use WunderPass to top up your account with USD'}
          </Alert>
          <Link
            href={`${process.env.WUNDERPASS_URL}/balance/topUp?redirectUrl=${redirectUrl}`}
          >
            <button className="btn btn-info">TopUp Now</button>
          </Link>
          <div className="flex flex-row justify-start items-center mt-2">
            <Checkbox checked={checked} onChange={handleChange} />
            <Typography className="pt-1">
              Don't show this info again.
            </Typography>
          </div>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
