import { Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UseUserType } from '../../../hooks/useUser';
import PayPalLogo from '/assets/PayPal/logo.svg';

let timer;

type PayPalButtonProps = {
  user: UseUserType;
  amount: number;
};

export default function PayPalButton(props: PayPalButtonProps) {
  const { user, amount } = props;
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    setRedirectUrl(null);
    setTransactionId(null);
    if (!user || !user.wunderId) return;
    if (amount && amount > 0) {
      setLoading(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        axios({
          method: 'post',
          url: '/api/paypal/init',
          data: {
            currency: 'EUR',
            amount: amount,
            callbackUrl: `${
              new URL(document.URL).origin
            }/balance/topUp/success`,
            wunderId: user.wunderId,
          },
        }).then((res) => {
          setLoading(false);
          setTransactionId(res?.data?.transactionId);
          setRedirectUrl(res?.data?.redirectUrl);
        });
      }, 800);
    } else {
      setRedirectUrl(null);
    }
  }, [user.wunderId, amount]);

  return (
    <Box sx={{ width: '100%', mx: 'auto !important' }}>
      <Button
        className="rounded-xl"
        disableElevation
        disabled={!redirectUrl}
        variant="contained"
        sx={{
          width: '100%',
          background: '#FFC33A',
          '&:hover': { background: '#F9BD34' },
        }}
        href={redirectUrl}
      >
        {loading ? (
          <CircularProgress size={30} />
        ) : (
          <Image
            className={redirectUrl ? '' : 'grayscale'}
            src={PayPalLogo}
            priority
          />
        )}
      </Button>
    </Box>
  );
}
