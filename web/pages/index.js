import { Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoginWithWunderPass from '/components/auth/loginWithWunderPass';

export default function Home(props) {
  const { user } = props;
  const router = useRouter();

  const handleSuccess = (data) => {
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

  useEffect(() => {
    if (user.wunderId && user.address) {
      router.push('/pools');
    }
  }, [user]);

  return (
    <>
      <div className="w-screen">
        <div
          //CHOSE ONE STYLE
          //className="flex bg-gradient-to-b from-sky-500 via-sky-400 to-white w-screen h-screen items-center justify-center"
          className="flex bg-split-blue-white w-screen h-screen items-center justify-center"
        >
          <div className="flex flex-row w-4/5 h-4/5 border-solid border-1 border-[#ADD8E6] rounded-lg bg-white shadow-custom place-self-center">
            <div className="bg-sky-500 w-40-%">BILD</div>
            <div className="bg-gray-100 w-2/3">
              <Typography variant="h3">LOGIN</Typography>
              <LoginWithWunderPass
                name="WunderPool"
                redirect={'pools'}
                intent={['wunderId', 'address']}
                onSuccess={handleSuccess}
                image="https://img.ifunny.co/images/f360247a15cf0bed362b8e9ddbe9786c0465023c969906d57f3f5bf85aa2656e_1.webp"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
