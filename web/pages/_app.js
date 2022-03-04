import useUser from '/hooks/useUser'
import '../styles/globals.css'
import useNotification from '/hooks/useNotification';
import Notification from '/components/utils/notification';

function WunderPool({ Component, pageProps }) {
  const user = useUser();
  const [notification, handleError, handleSuccess, handleInfo, handleWarning] = useNotification();

  const appProps = Object.assign({
    user, handleError, handleSuccess, handleInfo, handleWarning
  }, pageProps)

  return (
    <>
      <Component {...appProps} />
      <Notification notification={notification} />
    </>
  )
}

export default WunderPool
