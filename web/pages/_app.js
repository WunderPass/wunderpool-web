import useUser from '/hooks/useUser';
import '../styles/globals.css';
import useNotification from '/hooks/useNotification';
import Notification from '/components/utils/notification';
import usePoolListener from '/hooks/usePoolListener';
import AlertTemplate from 'react-alert-template-basic';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import muiTheme from '/theme/mui';
import Navbar from '/components/layout/navbar';
import TopUpAlert from '../components/dialogs/topUpAlert';
import Head from 'next/head';
import { HistoryManagerProvider, useHistoryManager } from '/hooks/useHistory';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as ga from '../lib/google-analytics';

function WunderPool({ Component, pageProps }) {
  //LogRocket.init(process.env.LOG_ROCKET_ID);
  const router = useRouter();
  const user = useUser();
  const [notification, handleError, handleSuccess, handleInfo, handleWarning] =
    useNotification();
  const [
    setupPoolListener,
    votedEvent,
    newProposalEvent,
    newMemberEvent,
    tokenAddedEvent,
    proposalExecutedEvent,
    resetEvents,
  ] = usePoolListener(handleInfo);
  const historyManager = useHistoryManager();

  const appProps = Object.assign(
    {
      user,
      handleError,
      handleSuccess,
      handleInfo,
      handleWarning,
      setupPoolListener,
      votedEvent,
      newProposalEvent,
      newMemberEvent,
      tokenAddedEvent,
      proposalExecutedEvent,
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

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  //useEffect(() => {
  //  if (user.address && user.wunderId) {
  //    LogRocket.identify(user.address, {
  //      name: user.wunderId,
  //      email: 'comingSoon@gmail.com',
  //    });
  //  }
  //}, [user.wunderId, user.address]);

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
          name="description"
          content="Pool capital with your friends, vote on crypto plays and make bank together!"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#5F45FD" />
        <link rel="apple-touch-icon" href="/images/touch/homescreen512.png" />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/images/touch/homescreen144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="168x168"
          href="/images/touch/homescreen168.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/images/touch/homescreen192.png"
        />
        <meta
          name="twitter:image"
          content="https://app.casama.io/images/touch/homescreen192.png"
        />
        <meta name="twitter:creator" content="@casama_io" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://app.casama.io/images/touch/homescreen512.png"
        />
      </Head>
      <HistoryManagerProvider value={historyManager}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={muiTheme}>
            <AlertProvider template={AlertTemplate} {...options}>
              <Navbar {...appProps} />
              <Component {...appProps} />
              <Notification notification={notification} />
              <TopUpAlert
                open={user.topUpRequired}
                setOpen={user.setTopUpRequired}
                user={user}
              />
            </AlertProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </HistoryManagerProvider>
    </>
  );
}

export default WunderPool;
