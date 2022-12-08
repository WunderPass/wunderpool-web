import { Container, LinearProgress } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import EmailVerificationCard from '../../components/general/profile/emailVerificationCard';
import fs from 'fs';

export default function RewardsPage(props) {
  const { user, handleError } = props;
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(null);

  useEffect(async () => {
    setLoading(true);
    if (user.loginMethod != 'Casama') return;
    try {
      const { signedMessage, signature } = await user.getSignedMillis();
      const { data } = await axios({
        url: '/api/users/getProfile',
        params: { wunderId: user.wunderId },
        headers: { signed: signedMessage, signature },
      });
      setEmailVerified(data?.contactDetails?.email_verified);
    } catch (error) {
      console.log(error);
      handleError('Rewards currently not available');
    }
    setLoading(false);
  }, [user.loginMethod]);

  if (user.loginMethod == 'Casama') {
    return (
      <Container className="mt-5" maxWidth="lg">
        <div className="flex flex-col items-center justify-center gap-3">
          <h1 className="text-3xl font-semibold">Rewards</h1>
          {loading ? (
            <LoadingPage />
          ) : emailVerified ? (
            <RewardsSection />
          ) : (
            <AccountUnverified {...props} />
          )}
        </div>
      </Container>
    );
  }
  return <RewardsNotAvailable />;
}

function LoadingPage() {
  return (
    <>
      <LinearProgress color="casamaBlue" />
      <p>Loading Rewards...</p>
    </>
  );
}

function RewardsSection() {
  return (
    <>
      <p>Insert Rewards here :)</p>
    </>
  );
}

function AccountUnverified(props) {
  const { user, wunderIdsNotified } = props;
  return (
    <>
      <h3 className="text-xl">
        In order to get Rewards, you have to verify your Email Address
      </h3>
      {user.email ? (
        <EmailVerificationCard
          wunderIdsNotified={wunderIdsNotified}
          {...props}
        />
      ) : (
        <Link href="/profile">
          <a className="btn-casama px-3 py-2">Update your Email</a>
        </Link>
      )}
    </>
  );
}

function RewardsNotAvailable() {
  return (
    <Container className="mt-5" maxWidth="lg">
      <div className="flex flex-col items-center justify-center gap-3">
        <h1 className="text-3xl font-semibold">
          Rewards are only available for Casama Users
        </h1>
        <Link href="/betting">
          <a className="btn-casama px-3 py-2">View Bets</a>
        </Link>
      </div>
    </Container>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      wunderIdsNotified: JSON.parse(
        fs.readFileSync('./data/verificationMailsSent.json', 'utf8')
      ),
    },
  };
}
