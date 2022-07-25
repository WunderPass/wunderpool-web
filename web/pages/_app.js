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

function WunderPool({ Component, pageProps }) {
  const user = useUser();
  const [notification, handleError, handleSuccess, handleInfo, handleWarning] =
    useNotification();
  const [
    setupPoolListener,
    votedEvent,
    newProposalEvent,
    tokenAddedEvent,
    proposalExecutedEvent,
    resetEvents,
  ] = usePoolListener(handleInfo);

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

  return (
    <>
      <Head>
        <meta name="application-name" content="Casama" />
        <meta
          name="description"
          content="Pool capital with your friends, vote on crypto plays and make bank together!"
        />

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
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="Casama" />
        <meta name="twitter:url" content="https://app.casama.io" />
        <meta name="twitter:title" content="Casama" />
        <meta
          name="twitter:description"
          content="Pool capital with your friends, vote on crypto plays and make bank together!"
        />
        <meta
          name="twitter:image"
          content="https://app.casama.io/images/touch/homescreen192.png"
        />
        <meta name="twitter:creator" content="@casama_io" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Casama" />
        <meta
          property="og:description"
          content="Pool capital with your friends, vote on crypto plays and make bank together!"
        />
        <meta property="og:site_name" content="Casama" />
        <meta property="og:url" content="https://app.casama.io" />
        <meta
          property="og:image"
          content="https://app.casama.io/images/touch/homescreen512.png"
        />
      </Head>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <AlertProvider template={AlertTemplate} {...options}>
            <Navbar {...appProps} />
            <Component {...appProps} />
            <Notification notification={notification} />
            <TopUpAlert
              open={user.topUpRequired}
              setOpen={() => user.setTopUpRequired(false)}
              user={user}
            />
          </AlertProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

export default WunderPool;
