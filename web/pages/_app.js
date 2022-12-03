import useUser from '/hooks/useUser';
import '/styles/globals.css';
import useNotification from '/hooks/useNotification';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useEventListener from '/hooks/useEventListener';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import muiTheme from '/theme/mui';
import Navbar from '/components/general/layout/navbar';
import TopUpAlert from '/components/general/dialogs/topUpAlert';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import * as ga from '../lib/google-analytics';
import SwitchChainAlert from '/components/general/dialogs/switchChainAlert';
import Head from 'next/head';
import PasswordRequiredAlert from '/components/general/dialogs/passwordRequiredAlert';
import BackupSeedPhraseAlert from '/components/general/dialogs/backupSeedPhraseAlert';
import UseIOS from '/hooks/useIOS';
import useBettingService from '/hooks/useBettingService';
import ReactourProvider from '../components/general/utils/reactourProvider';
import axios from 'axios';

function WunderPool({ Component, pageProps }) {
  const router = useRouter();
  const user = useUser();
  const [isFetched, setIsFetched] = useState(false);
  const [handleError, handleSuccess, handleInfo, handleWarning, handlePromise] =
    useNotification();
  const {
    updateListener,
    newPoolEvent,
    newMemberEvent,
    newProposalEvent,
    votedEvent,
    proposalExecutedEvent,
    tokenAddedEvent,
    resetEvents,
  } = useEventListener(handleInfo);

  const { updateWunderId, updateBackgroundColor } = UseIOS();

  const bettingService = useBettingService(user.address, handleError);
  const appProps = Object.assign(
    {
      user,
      bettingService,
      handleError,
      handleSuccess,
      handleInfo,
      handleWarning,
      handlePromise,
      updateListener,
      newPoolEvent,
      newMemberEvent,
      newProposalEvent,
      votedEvent,
      proposalExecutedEvent,
      tokenAddedEvent,
      resetEvents,
    },
    pageProps
  );

  //reroute user if not logged in
  useEffect(() => {
    if (user.loggedIn === null && !isFetched) {
      setIsFetched(true);
      return;
    }

    if (
      user.loggedIn === null &&
      ![
        '/investing/pools/join/[address]',
        '/investing/pools/[address]',
        '/betting/join/[competitionId]',
        '/betting/join/[competitionId]/[gameId]',
        '/betting/[address]',
      ].includes(router.pathname)
    ) {
      router.push('/');
    }
  }, [router.pathname, user.loggedIn, isFetched]);

  useEffect(() => {
    if (router.pathname == '/') {
      updateBackgroundColor('#FFFFFF', '#000000');
    } else {
      updateBackgroundColor('#5F45FD', '#FFFFFF');
    }
  }, [router.pathname]);

  useEffect(() => {
    updateWunderId(user.wunderId);
    const pingInterval = setInterval(() => {
      axios({
        url: '/api/users/ping',
        params: { wunderId: user.wunderId, handle: user.userName },
      });
    }, 10000);
    return () => clearInterval(pingInterval);
  }, [user.wunderId]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_CODE}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', '${process.env.GA_TRACKING_CODE}');`}
      </Script>
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta name="apple-itunes-app" content="app-id=6443918043"></meta>
      </Head>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <ReactourProvider>
            <Navbar {...appProps} />
            <div
              className="w-full mb-20 sm:mb-5"
              style={{
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              <Component {...appProps} />
            </div>
            <ToastContainer
              position="top-right"
              autoClose={8000}
              style={{ marginTop: 'env(safe-area-inset-top)' }}
            />
            <TopUpAlert
              open={user.topUpRequired && user.notifications.length == 0}
              setOpen={user.setTopUpRequired}
              user={user}
            />
            <SwitchChainAlert user={user} />
            <PasswordRequiredAlert
              passwordRequired={user.passwordRequired}
              user={user}
            />
            <BackupSeedPhraseAlert user={user} />
          </ReactourProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

export default WunderPool;
