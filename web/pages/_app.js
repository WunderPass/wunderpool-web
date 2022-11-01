import useUser from '/hooks/useUser';
import '../styles/globals.css';
import useNotification from '/hooks/useNotification';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePoolListener from '/hooks/usePoolListener';
import AlertTemplate from 'react-alert-template-basic';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import muiTheme from '/theme/mui';
import Navbar from '/components/layout/navbar';
import TopUpAlert from '../components/dialogs/topUpAlert';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import * as ga from '../lib/google-analytics';
import SwitchChainAlert from '../components/dialogs/switchChainAlert';
import Head from 'next/head';
import PasswordRequiredAlert from '../components/dialogs/passwordRequiredAlert';

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
  } = usePoolListener(handleInfo);

  const appProps = Object.assign(
    {
      user,
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

  const options = {
    position: positions.BOTTOM_CENTER,
    timeout: 5000,
    offset: '30px',
    transition: transitions.SCALE,
  };

  //reroute user if not logged in
  useEffect(() => {
    if (user.loggedIn === null && !isFetched) {
      setIsFetched(true);
      return;
    }

    if (
      user.loggedIn === null &&
      !['/pools/join/[address]'].includes(router.pathname)
    ) {
      router.push('/');
    }
  }, [router.pathname, user.loggedIn, isFetched]);

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
      </Head>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <AlertProvider template={AlertTemplate} {...options}>
            <Navbar {...appProps} />
            <Component {...appProps} />
            <ToastContainer
              position="top-right"
              autoClose={8000}
              style={{ marginTop: 'env(safe-area-inset-top)' }}
            />
            <TopUpAlert
              open={user.topUpRequired}
              setOpen={user.setTopUpRequired}
              user={user}
            />
            <SwitchChainAlert user={user} />
            <PasswordRequiredAlert user={user} />
          </AlertProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

export default WunderPool;
