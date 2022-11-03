import { useState, useEffect } from 'react';
import CasamaIcon from '/public/casama_logo.png';
import Image from 'next/image';

export default function IOSAuthGuard({ triggerBiometry }) {
  const [authenticated, setAuthenticated] = useState(false);

  const login = () => {
    triggerBiometry('Login to Casama', (success) => {
      setAuthenticated(success);
    });
  };

  useEffect(() => {
    if (authenticated) return;
    login();
  }, []);

  return authenticated ? null : (
    <div
      className="absolute top-0 left-0 w-screen h-screen bg-white flex flex-col items-center justify-center"
      style={{ zIndex: 10000 }}
    >
      <div className="w-[50vw] -translate-y-1/2">
        <Image src={CasamaIcon} alt="CasamaIcon" layout="responsive" />
      </div>
      <button className="btn-casama px-5 py-2 text-xl" onClick={login}>
        Login
      </button>
    </div>
  );
}
