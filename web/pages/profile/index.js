import { Container } from '@mui/material';
import StartTutorialCard from '../../components/general/profile/startTutorialCard';
import SeedPhraseCard from '../../components/general/profile/seedPhraseCard';
import EditProfileCard from '../../components/general/profile/editProfileCard';

export default function Profile(props) {
  const { user } = props;

  const handleLogout = () => {
    user.logOut();
  };

  return (
    <Container className="mt-5" maxWidth="lg">
      <EditProfileCard {...props} />
      <StartTutorialCard />
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
