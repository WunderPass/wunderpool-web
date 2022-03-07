import useUser from '/hooks/useUser'
import '../styles/globals.css'
import useNotification from '/hooks/useNotification';
import Notification from '/components/utils/notification';
import usePoolListener from '/hooks/usePoolListener';

function WunderPool({ Component, pageProps }) {
  const user = useUser();
  const [notification, handleError, handleSuccess, handleInfo, handleWarning] = useNotification();
  const setupPoolListener = usePoolListener(handleInfo);

  const appProps = Object.assign({
    user, handleError, handleSuccess, handleInfo, handleWarning, setupPoolListener
  }, pageProps)

  return (
    <>
      <Component {...appProps} />
      <Notification notification={notification} />
    </>
  )
}

export default WunderPool
