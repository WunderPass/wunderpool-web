import LoginWithWunderPass from '/components/auth/loginWithWunderPass';
import WunderPoolIcon from '/public/wunderpool_logo_white.svg';
import { Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/Head';
import { Button } from '@mui/material';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
//import { FaFacebookF } from 'react-icons/fa';

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
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Head>
          <title>WunderPool</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <div className="lg:flex rounded-2xl shadow-custom lg:w-2/3 lg:max-w-4xl">
            <div className="h-2/5 bg-wunder-blue text-white rounded-t-2xl py-12 lg:py-36 lg:w-2/5 lg:rounded-tl-2xl lg:rounded-bl-2xl lg:rounded-tr-none">
              <div className="ml-10 lg:ml-6 flex-1">
                <Image
                  className=""
                  src={WunderPoolIcon}
                  alt="WunderPoolIcon"
                  layout="responsive"
                />
              </div>
              <div className="px-6 lg:px-12">
                <div className="text-center w-full pb-4"></div>
                <h6 className="text-1xl font-bold mb-0">
                  Invest with Friends, loose money together!
                </h6>
                <div className="border-2 w-6 border-white inline-block mb-2 bg-white lg:w-10"></div>
                <p className="text-xs mb-2 lg:mb-0 mt-2">
                  Choose a way to connect and start aping!
                </p>
                <button
                  className="btn-connect text-xs mt-2 px-1 lg:px-2 lg:mt-6"
                  href="#"
                >
                  Create WunderPass
                </button>
                <p className="text-mobile rounded-full pt-0.5">coming soon</p>
              </div>
            </div>

            <div className="p-5 lg:w-3/5 ">
              <div className="py-5 lg:py-10">
                <h2 className="text-3xl font-bold text-wunder-blue">
                  Sign in with WunderPass
                </h2>
                <div className="border-2 w-6 border-wunder-blue inline-block mb-2 lg:w-10"></div>
                <p className="text-gray-400 text-xs my-3 mb-10">
                  Use your WunderPass or connect a exisiting wallet to a new
                  WunderPass wallet!
                </p>

                <div className="flex flex-col items-center mb-12 lg:mb-20">
                  <div className="my-2 w-72 items-center mb-6 lg:mt-6">
                    <LoginWithWunderPass
                      className="text-xs"
                      name="WunderPool"
                      redirect={'pools'}
                      intent={['wunderId', 'address']}
                      onSuccess={handleSuccess}
                      image="https://img.ifunny.co/images/f360247a15cf0bed362b8e9ddbe9786c0465023c969906d57f3f5bf85aa2656e_1.webp"
                    />
                  </div>

                  <button
                    className="btn-connect w-72 flex text-center justify-center bg-wunder-blue rounded-md px-2 py-10 font-bold text-md hover:bg-[#e7e7e7]"
                    onClick={doNothing()}
                    variant="contained"
                  >
                    Connect Wallet with Wunderpass
                  </button>
                  <p className="text-mobile text-wunder-blue rounded-full pt-0.5">
                    coming soon
                  </p>
                </div>

                <div className="flex flex-row justify-center lg:my-2">
                  <a
                    href="#"
                    className="p-2 mx-1 rounded-full border-2 border-gray-200 lg:p-3 "
                  >
                    <FaTwitter className="text-sm "></FaTwitter>
                  </a>
                  <a
                    href="#"
                    className="p-2 mx-1 rounded-full border-2 border-gray-200 lg:p-3 "
                  >
                    <FaDiscord className="text-sm "></FaDiscord>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
