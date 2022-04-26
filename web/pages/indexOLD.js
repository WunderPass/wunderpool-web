import LoginWithWunderPass from '/components/auth/loginWithWunderPass';
import WunderPoolIcon from '/public/wunderpool_logo_white.svg';
import { Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@mui/material';

export default function Home(props) {
  const { user } = props;
  const router = useRouter();

  const handleSuccess = (data) => {
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

  const doNothing = () => {};

  useEffect(() => {
    if (user.wunderId && user.address) {
      router.push('/pools');
    }
  }, [user]);

  return (
    <>
      <div className="w-screen">
        <div className="flex bg-split-blue-white w-screen h-screen items-center justify-center">
          <div className="flex flex-row w-4/5 h-3/5 border-solid border-1 border-[#ADD8E6] bg-white shadow-custom">
            <div className="flex justify-center bg-wunder-light-blue min-w-40-% w-40-% pl-6">
              <div className="flex items-stretch pl-5 pb-60">
                <Image
                  className="pl-2"
                  src={WunderPoolIcon}
                  alt="WunderPoolIcon"
                  width="500%"
                  layout="intrinsic"
                />
              </div>
            </div>
            <div className="flex-col w-2/3 bg-white ">
              <div>
                <Typography className="text-xs text-right p-1 cursor-pointer">
                  Need help?
                </Typography>
                <div className="flex flex-col items-center m-6  bg-white w-fit">
                  <Typography className="font-bold text-2xl text-center pt-28 pb-32">
                    Log in
                  </Typography>
                  <div className="pb-6">
                    <div className="text-center pb-6">
                      <LoginWithWunderPass
                        name="WunderPool"
                        redirect={'pools'}
                        intent={['wunderId', 'address']}
                        onSuccess={handleSuccess}
                        image="https://img.ifunny.co/images/f360247a15cf0bed362b8e9ddbe9786c0465023c969906d57f3f5bf85aa2656e_1.webp"
                      />
                    </div>
                    <div className="text-center pb-6">
                      <button
                        className="btn-connect hover:bg-[#e7e7e7]"
                        onClick={doNothing()}
                        variant="contained"
                      >
                        Connect Wallet with Wunderpass
                      </button>
                    </div>
                    <div>
                      <button
                        className="btn-connect hover:bg-[#e7e7e7]"
                        onClick={doNothing()}
                        variant="contained"
                      >
                        Create new WunderPass
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
