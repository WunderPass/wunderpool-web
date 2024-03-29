import AuthenticateWithCasama from '../components/general/auth/authenticateWithCasama';
import LoginWithMetaMask from '../components/general/auth/loginWithMetaMask';
import LoginWithWalletConnect from '../components/general/auth/loginWithWalletConnect';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import CustomHeader from '../components/general/utils/customHeader';
ReactGA.initialize(process.env.GA_TRACKING_CODE);
import * as ga from '../lib/google-analytics';
import { UseUserType } from '../hooks/useUser';
import { UseNotification } from '../hooks/useNotification';

type HomeProps = {
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function Home(props: HomeProps) {
  const { user, handleError } = props;
  const [loaded, setLoaded] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isReferred, setIsReferred] = useState(false);
  const router = useRouter();

  const handleSuccess = ({ wunderId, address, loginMethod, newUser }) => {
    ga.event({
      action: 'conversion',
      category: newUser ? 'signup' : 'login',
      label: loginMethod,
    });
    setIsNewUser(newUser);
    user.updateLoginMethod(loginMethod);
    user.updateWunderId(wunderId);
    user.updateAddress(address);
  };

  useEffect(() => {
    if (typeof router.query?.referrer != 'string') return;
    setIsReferred(true);
    localStorage.setItem('referrer', router.query?.referrer);
  }, [router.query]);

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  });

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (user.loggedIn) {
      router.push(isNewUser ? '/onboarding' : '/betting/multi');
    }
  }, [user.loggedIn]);

  return (
    <>
      <CustomHeader />
      <div className="flex flex-col h-screen lg:pt-7">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center bg-white lg:bg-[#f3f3f3] ">
          <div className="h-screen lg:h-fit lg:flex rounded-2xl shadow-custom lg:w-2/3 w-screen lg:mb-7 ">
            <div className="p-5 bg-white rounded-2xl w-full">
              <div className="flex justify-center flex-col items-center py-5 lg:py-10 mb-14 w-full">
                {isReferred ? (
                  <>
                    <h2 className="text-3xl font-medium text-casama-blue mt-3 mb-6">
                      Congratulations, you reached us with a referrer code!
                    </h2>
                    <div className="border-2 w-6 border-casama-blue bg-casama-blue inline-block mb-2 lg:w-10"></div>
                    <p className="text-gray-400 text-lg mt-10 mb-10 lg:mb-10 w-2/3 text-center">
                      You have used a referrer link to reach us. Sign up to
                      unlock the benefits for your referrer!
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-medium text-casama-blue mt-3 mb-6">
                      You need a wallet to use Casama
                    </h2>
                    <div className="border-2 w-6 border-casama-blue bg-casama-blue inline-block mb-2 lg:w-10"></div>
                    <p className="text-gray-400 text-lg mt-10 mb-10 lg:mb-10 w-2/3 text-center">
                      Connect with an external wallet, or use our integrated
                      Wallet to save all gas fees and get free credits.
                    </p>
                  </>
                )}

                <div className="w-full max-w-sm">
                  {loaded && (
                    <AuthenticateWithCasama onSuccess={handleSuccess} />
                  )}
                </div>
                {loaded && (
                  <div className="flex flex-col items-center justify-between mb-12 lg:mb-4 max-w-xs w-full">
                    <div className="my-2 w-72 items-center mb-2">
                      <p className="text-gray-400 text-sm my-2 mb-1 lg:mb-1 mt-8">
                        Already have a wallet?
                      </p>
                    </div>

                    <LoginWithMetaMask
                      onSuccess={handleSuccess}
                      handleError={handleError}
                    />
                    <LoginWithWalletConnect onSuccess={handleSuccess} />
                  </div>
                )}
                <div className="flex flex-row justify-center lg:my-2">
                  <a
                    href="https://twitter.com/casama_io"
                    className="p-2 mx-1 rounded-full border-2 border-gray-200 lg:p-3 "
                  >
                    <FaTwitter className="text-sm "></FaTwitter>
                  </a>
                  <a
                    href="https://t.me/+sVH-nNZB4g0zYmRk"
                    className="p-2 mx-1 rounded-full border-2 border-gray-200 lg:p-3 "
                  >
                    <FaTelegramPlane className="text-sm "></FaTelegramPlane>
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
