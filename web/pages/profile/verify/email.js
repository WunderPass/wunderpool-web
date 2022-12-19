import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Divider, LinearProgress } from '@mui/material';
import { IoMdNotifications } from 'react-icons/io';
import Link from 'next/link';

export default function VerifyEmailPage(props) {
  const { user, handleSuccess, handleError } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(async () => {
    setLoading(true);
    if (user.isReady && router.isReady) {
      try {
        const { signedMessage, signature } = await user.getSignedMillis();
        const result = await axios({
          method: 'POST',
          url: '/api/users/verify/verifyMail',
          data: { wunderId: user.wunderId, code: router.query.code },
          headers: { signed: signedMessage, signature },
        });
        console.log(result);
        handleSuccess('Email Verified');
        user.fetchNotifications();
      } catch (error) {
        console.log(error?.response?.data);
        setError(error?.response?.data);
        handleError(error, user.wunderId, user.userName);
      }
      setLoading(false);
    }
  }, [router.isReady, user.isReady]);

  return (
    <Container className="mt-20" maxWidth="lg">
      {loading ? (
        <>
          <LinearProgress color="casamaBlue" />
          <p className="text-center mt-5">Verifiying your Email...</p>
        </>
      ) : (
        <div className="flex flex-col gap-3 items-center">
          {error ? (
            <>
              <h3 className="text-xl font-semibold text-center">
                {typeof error == 'string'
                  ? `The following Error occurred: ${error}`
                  : 'An Error occurred'}
              </h3>
              <p className="text-center">
                Please contact us on Twitter
                <a
                  href="https://twitter.com/casama_io"
                  className="text-casama-blue mx-1 underline"
                >
                  @casama_io
                </a>
                so we can resolve your issue
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-center">
                Email Verified
              </h3>
              <p className="text-center">
                Check out the{' '}
                <Link href="/profile/rewards">
                  <a className="btn-casama px-2 py-2">Rewards</a>
                </Link>{' '}
                Page to earn cash for achieving Challenges.
              </p>
            </>
          )}
          <Divider className="w-full" />
          <Link href="/betting">
            <a className="btn-casama text-xl px-2 py-3">Start Betting</a>
          </Link>
        </div>
      )}
    </Container>
  );
}
