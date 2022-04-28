import { useState } from 'react';

export default function LoginWithWunderPass(props) {
  const { name, image, intent = [], onSuccess } = props;
  const [popup, setPopup] = useState(null);

  const handleClick = (e) => {
    e.preventDefault();
    const authPopup =
      popup ||
      window.open(
        encodeURI(
          `${process.env.WUNDERPASS_URL}/oAuth?name=${name}&imageUrl=${image}&redirectUrl=${document.URL}`
        ),
        'WunderPassAuth',
        'popup'
      );
    setPopup(authPopup);

    const requestInterval = setInterval(() => {
      authPopup.postMessage(
        { accountId: 'ABCDE', intent: intent },
        process.env.WUNDERPASS_URL
      );
    }, 1000);

    window.addEventListener('message', (event) => {
      if (event.origin == process.env.WUNDERPASS_URL) {
        clearInterval(requestInterval);

        if (event.data?.wunderId) {
          onSuccess(event.data);
          event.source.window.close();
          setPopup(null);
        }
      }
    });

    const closedListener = setInterval(() => {
      if (authPopup.closed) {
        setPopup(null);
        clearInterval(closedListener);
      }
    }, 500);
  };

  const goBack = (e) => {
    e.preventDefault();
    popup.focus();
  };

  const cancelAuth = (e) => {
    e.preventDefault();
    setPopup(null);
    popup.close();
  };

  return (
    <>
      <a href={process.env.WUNDERPASS_URL} onClick={handleClick}>
        <p
          className="text-xs text-wunder-blue pt-0.5 underline cursor-pointer lg:mb-10"
          onClick={handleClick}
        >
          Create your WunderPass now
        </p>
      </a>
      {popup && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            width: '100vw',
            height: '100vh',
            background: '#000C',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <a href="#" onClick={goBack}>
            Go Back
          </a>
          <a href="#" onClick={cancelAuth}>
            Cancel
          </a>
        </div>
      )}
    </>
  );
}
