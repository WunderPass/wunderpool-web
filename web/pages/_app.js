import useUser from '/hooks/useUser';
import '../styles/globals.css';
import useNotification from '/hooks/useNotification';
import Notification from '/components/utils/notification';
import usePoolListener from '/hooks/usePoolListener';
import AlertTemplate from 'react-alert-template-basic';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';

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
      <AlertProvider template={AlertTemplate} {...options}>
        <Component {...appProps} />
        <Notification notification={notification} />
      </AlertProvider>
    </>
  );
}

export default WunderPool;
