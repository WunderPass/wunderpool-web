import CreateYourWunderPass from '/components/auth/createYourWunderPass';
import LoginWithWunderPass from '/components/auth/loginWithWunderPass';
import CasamaIcon from '/public/casama-wht.svg';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';

export default function Home(props) {
  const { user } = props;
  const router = useRouter();
  const [popup, setPopup] = useState(null);
  const [signing, setSigning] = useState(false);

  const handleSuccess = (data) => {
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

  const handleClick = () => {
    setSigning(true);
  };

  useEffect(() => {
    if (user.wunderId && user.address) {
      user.addToDatabase();
      router.push('/pools');
    }
  }, [user]);

  return (
    <>
      <div className="flex flex-col h-screen lg:pt-7 ">
        <Head>
          <title>Casama</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center ">
          <div className="h-screen lg:h-fit lg:flex rounded-2xl shadow-custom lg:w-2/3 lg:max-w-6xl w-screen lg:mb-7 ">
            <div className="bg-kaico-blue text-white lg:rounded-t-2xl lg:py-52 lg:w-2/5 lg:rounded-tl-2xl lg:rounded-bl-2xl lg:rounded-tr-none">
              <div className="flex-1 justify-center items-center mx-24 lg:mx-8 pt-6 lg:pt-0 ">
                <Image
                  className=""
                  src={CasamaIcon}
                  alt="WunderPoolIcon"
                  layout="responsive"
                />
              </div>
              <div className="px-6 lg:px-12">
                <div className="text-center w-full pb-4"></div>
                <h6 className="text-2xl font-bold mb-6">
                  Unlock collective gains!
                </h6>
                <div className="border-2 w-6 border-white inline-block mb-2 bg-white lg:w-10"></div>
                <p className="text-md lg:pb-12 lg:mb-0 pb-6 mt-6 ">
                  Pool capital with your friends, vote on crypto plays and make
                  bank together!
                </p>
              </div>
            </div>

            <div className="p-5  bg-white rounded-bl-2xl lg:rounded-bl-none rounded-br-2xl lg:rounded-tr-2xl lg:w-3/5">
              <div className="py-5 lg:py-10 mb-14">
                <h2 className="text-3xl font-bold text-kaico-blue mb-6">
                  Sign in with WunderPass
                </h2>
                <div className="border-2 w-6 border-kaico-blue bg-kaico-blue inline-block mb-2 lg:w-10"></div>
                <p className="text-gray-400 text-md my-3 mb-10 lg:mb-20">
                  Using WunderPass makes it easy to interact with Casama on the
                  Polygon network as you don't have to pay for transaction fees.
                </p>

                <div className="flex flex-col items-center justify-between mb-12 lg:mb-4">
                  <div className="my-2 w-72 items-center mb-1 lg:mt-6">
                    <a>
                      <LoginWithWunderPass
                        disablePopup
                        className="text-xs"
                        name="Casama"
                        redirect={'pools'}
                        intent={['wunderId', 'address']}
                        onSuccess={handleSuccess}
                        onClick={handleClick}
                      />
                    </a>
                  </div>
                  <p className="text-gray-400 text-xs my-2 mb-1 lg:mb-1">or</p>
                  <CreateYourWunderPass
                    name="Casama"
                    redirect={'pools'}
                    intent={['wunderId', 'address']}
                    onSuccess={handleSuccess}
                  />

                  <p className="text-xs text-kaico-blue rounded-full border-kaico-blue border-2 p-1 px-2 mt-10">
                    WalletConnect is coming soon!
                  </p>
                </div>

                <div className="flex flex-row justify-center lg:my-2">
                  <a
                    href="https://twitter.com/casama_io"
                    className="p-2 mx-1 rounded-full border-2 border-gray-200 lg:p-3 "
                  >
                    <FaTwitter className="text-sm "></FaTwitter>
                  </a>
                  <a
                    href="https://discord.gg/8dvbpJBS"
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
