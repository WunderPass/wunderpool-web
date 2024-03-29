import { useState } from 'react';
import { AuthCallback } from './types';

type CreateYourWunderPassProps = {
  name: string;
  image: string;
  intent?: string[];
  onSuccess: AuthCallback;
  text: string;
};

export default function CreateYourWunderPass(props: CreateYourWunderPassProps) {
  const { name, image, intent = [], onSuccess, text } = props;
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
        'width=400,height=490'
      );
    setPopup(authPopup);

    const requestInterval = setInterval(() => {
      authPopup.postMessage(
        { accountId: 'ABCDE', intent: intent },
        process.env.WUNDERPASS_URL
      );
    }, 1000);

    const handleMessage = (event) => {
      if (event.origin == process.env.WUNDERPASS_URL) {
        clearInterval(requestInterval);

        if (event.data?.wunderId) {
          onSuccess({ loginMethod: 'WunderPass', ...event.data });
          window.removeEventListener('message', handleMessage);
          event.source?.window?.close();
          setPopup(null);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const closedListener = setInterval(() => {
      if (authPopup.closed) {
        window.removeEventListener('message', handleMessage);
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
        {/* Casama Native Signup */}

        <div className="flex text-center items-center justify-center bg-casama-blue hover:bg-casama-dark-blue rounded-lg px-5 py-2 font-medium text-md">
          <p className="pl-2 lg:pl-3 p-1 text-white">
            {text || 'Create WunderPass wallet'}
          </p>
        </div>

        {/* WP Signup */}
        {/* <p
          className="text-xs text-casama-dark-blue hover:text-casama-light-blue pt-0.5 underline cursor-pointer lg:mb-10"
          onClick={handleClick}
        >
          Create your WunderPass now
        </p> */}
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
            background: '#f3f3f3',
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
