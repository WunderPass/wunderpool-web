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
import { HistoryManagerProvider, useHistoryManager } from '/hooks/useHistory';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as ga from '../lib/google-analytics';

function WunderPool({ Component, pageProps }) {
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
