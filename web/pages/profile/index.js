import { Container } from '@mui/material';
import fs from 'fs';
import EmailVerificationCard from '../../components/general/profile/emailVerificationCard';
import StartTutorialCard from '../../components/general/profile/startTutorialCard';
import SeedPhraseCard from '../../components/general/profile/seedPhraseCard';
import EditProfileCard from '../../components/general/profile/editProfileCard';

export default function Profile(props) {
  const { user, wunderIdsNotified } = props;

  const handleLogout = () => {
    user.logOut();
  };

  return (
    <Container className="mt-5" maxWidth="lg">
      <EditProfileCard {...props} />
      <StartTutorialCard />
      <EmailVerificationCard wunderIdsNotified={wunderIdsNotified} {...props} />
      {user.loginMethod == 'Casama' && <SeedPhraseCard />}
      <div className="flex items-center justify-center mt-5">
        <button
          className="btn-danger p-2 mx-6 w-full md:w-1/2"
          onClick={handleLogout}
        >
          Log out
        </button>
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
