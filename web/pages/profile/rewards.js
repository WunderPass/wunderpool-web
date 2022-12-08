import { Container, LinearProgress } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import EmailVerificationCard from '../../components/general/profile/emailVerificationCard';
import fs from 'fs';
import AchievementsCard from '/components/rewards/achievementsCard';
import { useHistory } from 'react-router-dom';

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
      <div className="sm:mt-8">
        <div className="flex flex-col items-center justify-center gap-3">
          {/* <h1 className="text-3xl font-semibold">Rewards</h1> */}
          {loading ? (
            <LoadingPage />
          ) : !emailVerified ? ( //TODO CHANGE BACK
            <RewardsSection />
          ) : (
            <AccountUnverified {...props} />
          )}
        </div>
      </div>
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
  const inviteFriends = () => {};

  return (
    <div className="container-gray ">
      <h1 className="text-3xl font-semibold">Reward Challenges</h1>

      <AchievementsCard
        title={'"Make money, not friends"'}
        description={
          'Invite 3 friends. Once they verify their email and place one bet you get'
        }
        bonus={'$5.00'}
        button={'Invite Friends'}
        progress={3}
        maxProgress={3}
        callToAction={inviteFriends}
        isButton={true}
      />

      <AchievementsCard
        title={'"Bet & Win"'}
        description={'Win 1 Betting game to unlock this achievement and get '}
        bonus={'$5.00'}
        button={'Bet on games'}
        progress={0}
        maxProgress={1}
        callToAction={'/betting'}
        isButton={false}
      />
    </div>
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
