import { CircularProgress, Container, Stack } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import { waitForTransaction } from '../../../services/contract/provider';
import { getNameFor } from '../../../services/memberHelpers';
import { UseUserType } from '../../../hooks/useUser';

type BalanceTopUpSuccessProps = {
  user: UseUserType;
};

export default function BalanceTopUpSuccess(props: BalanceTopUpSuccessProps) {
  const { user } = props;
  const router = useRouter();

  const [transactionId, setTransactionId] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [signature, setSignature] = useState(null);

  const [loading, setLoading] = useState(true);
  const [waitingForUSD, setWaitingForUSD] = useState(true);
  const [error, setError] = useState(null);

  const triggerTopup = () => {
    localStorage.setItem('topUpTransactionId', transactionId);
    axios({
      method: 'post',
      url: '/api/paypal/topUp',
      data: { transactionId: transactionId, chain: user.preferredChain },
      headers: {
        signed: signature.signedMessage,
        signature: signature.signature,
      },
    })
      .then((res) => {
        setLoading(false);
        axios({
          method: 'post',
          url: '/api/discord/topUp',
          data: { wunderId: getNameFor(user) },
        })
          .then(console.log)
          .catch(console.log);
        if (res.data) {
          setTransactionHash(res.data);
          localStorage.setItem(`topUpSuccess${transactionId}`, 'true');
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.error);
        axios({
          method: 'post',
          url: '/api/discord/topUpError',
          data: {
            transactionId,
            error: err?.response?.data?.error,
            wunderId: user?.wunderId,
            address: user?.address,
          },
        })
          .then(console.log)
          .catch(console.log);
        setLoading(false);
      });
  };

  const awaitTransaction = () => {
    localStorage.setItem('topUpTransactionHash', transactionHash);
    waitForTransaction(transactionHash, user.preferredChain).then(() => {
      setWaitingForUSD(false);
      user.fetchUsdBalance();
    });
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.transactionId) {
      setTransactionId(router.query.transactionId);
    } else {
      router.push('/balance');
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!user.isReady) return;
    if (!user.passwordRequired) {
      user
        .getSignedMillis()
        .then(({ signedMessage, signature }) =>
          setSignature({ signedMessage, signature })
        );
    }
  }, [user.passwordRequired, user.isReady]);

  useEffect(() => {
    if (transactionId && signature) {
      if (
        localStorage.getItem('topUpTransactionId') == transactionId &&
        localStorage.getItem(`topUpSuccess${transactionId}`)
      ) {
        setLoading(false);
        setTransactionHash(localStorage.getItem('topUpTransactionHash'));
      } else {
        triggerTopup();
      }
    }
  }, [transactionId, signature]);

  useEffect(() => {
    if (!transactionHash) return;
    awaitTransaction();
  }, [transactionHash]);

  return (
    <Container className="mt-5" maxWidth="lg">
      {error ? (
        <Stack spacing={3} alignItems="center">
          <p className="text-2xl md:text-4xl">Sorry something went wrong</p>
          <p className="text-red-600 text-xl">{error}</p>
          <p>
            The Casama Team has already been notified and will reach out to you
            once your Error was resolved.
          </p>
        </Stack>
      ) : (
        <Stack spacing={3} alignItems="center">
          <p className="text-2xl md:text-4xl text-casama-blue">
            Processing your Payment
          </p>
          <Stack
            direction="row"
            spacing={2}
            alignSelf="start"
            alignItems="center"
          >
            {signature ? (
              <CheckCircleIcon color="success" />
            ) : (
              <CircularProgress size={20} />
            )}
            <p className="text-xl md:text-3xl">Send Request</p>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            alignSelf="start"
            alignItems="center"
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <CheckCircleIcon color="success" />
            )}
            <p className="text-xl md:text-3xl">Requesting USD</p>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            alignSelf="start"
            alignItems="center"
          >
            {waitingForUSD ? (
              <CircularProgress size={20} />
            ) : (
              <CheckCircleIcon color="success" />
            )}
            <p className="text-xl md:text-3xl">Finalizing Transaction</p>
          </Stack>
          <Link href={'/betting/multi'}>
            <button className="btn-casama py-3 px-5 md:text-2xl">
              Continue to Casama
            </button>
          </Link>
        </Stack>
      )}
    </Container>
  );
}
