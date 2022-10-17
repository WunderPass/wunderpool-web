import CreateYourWunderPass from '/components/auth/createYourWunderPass';
import LoginWithWunderPass from '/components/auth/loginWithWunderPass';
import CasamaIcon from '/public/casama-wht.svg';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Image from 'next/image';
import ReactGA from 'react-ga';
import LoginWithMetaMask from '../components/auth/loginWithMetaMask';
import LoginWithWalletConnect from '../components/auth/loginWithWalletConnect';
import CustomHeader from '../components/utils/customHeader';
ReactGA.initialize(process.env.GA_TRACKING_CODE);

function Home(props) {
  const { user, handleError } = props;
  const router = useRouter();

  const handleSuccess = ({ wunderId, address, loginMethod }) => {
    user.updateLoginMethod(loginMethod);
    user.updateWunderId(wunderId);
    user.updateAddress(address);
  };

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  });

  useEffect(() => {
    if (user.loggedIn) {
      router.push('/pools');
    }
  }, [user.loggedIn]);

  return (
    <>
      <CustomHeader />
      <div className="flex flex-col h-screen lg:pt-7">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center bg-white lg:bg-[#f3f3f3] ">
          <div className="h-screen lg:h-fit lg:flex rounded-2xl shadow-custom lg:w-2/3  w-screen lg:mb-7 ">
            <div className="p-5 bg-white rounded-2xl w-full">
              <div className="flex justify-center flex-col items-center py-5 lg:py-10 mb-14">
                {/* <h2 className="text-3xl font-medium text-casama-blue mb-3 mt-10">
                  Create a wallet
                </h2>
                <p className="text-gray-400 text-sm">or</p> */}
                <h2 className="text-3xl font-medium text-casama-blue mt-3 mb-6">
                  You need a wallet to use Casama
                </h2>
                <div className="border-2 w-6 border-casama-blue bg-casama-blue inline-block mb-2 lg:w-10"></div>
                <p className="text-gray-400 text-lg mt-10 mb-10 lg:mb-10 w-2/3 text-center">
                  Connect with an external wallet, or use our integrated
                  WunderPass wallet to save all gas fees and get free credits.
                </p>
                <div className="flex flex-col items-center justify-between mb-12 lg:mb-4 ">
                  <div className="my-2 w-72 items-centerlg:mt-6 mb-2">
                    <div className="mb-14">
                      <CreateYourWunderPass
                        name="Casama"
                        redirect={'pools'}
                        intent={['wunderId', 'address']}
                        onSuccess={handleSuccess}
                      />
                    </div>

                    <p className="text-gray-400 text-sm my-2 mb-1 lg:mb-1 mt-8">
                      Already have a wallet?
                    </p>
                  </div>
                  <LoginWithWunderPass
                    disablePopup
                    className="text-xs"
                    name="Casama"
                    redirect={'pools'}
                    intent={['wunderId', 'address']}
                    onSuccess={handleSuccess}
                  />
                  <LoginWithMetaMask
                    test="test"
                    customClassName={'bg-black'}
                    onSuccess={handleSuccess}
                    handleError={handleError}
                  />
                  <LoginWithWalletConnect
                    onSuccess={handleSuccess}
                    handleError={handleError}
                  />
                </div>
                <div className="flex flex-row justify-center lg:my-2">
                  <a
                    href="https://twitter.com/casama_io"
                    className="p-2 mx-1 rounded-full border-2 border-gray-200 lg:p-3 "
                  >
                    <FaTwitter className="text-sm "></FaTwitter>
                  </a>
                  <a
                    href="https://discord.gg/DEZTc7t4th"
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

export default Home;
