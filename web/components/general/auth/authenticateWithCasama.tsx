import { Collapse } from '@mui/material';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import LoginWithCasama from './loginWithCasama';
import SignUpWithCasama from './signupWithCasama';
import { AuthCallback } from './types';

type AuthenticateWithCasamaProps = {
  onSuccess: AuthCallback;
};

export default function AuthenticateWithCasama({
  onSuccess,
}: AuthenticateWithCasamaProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const toggleSignup = () => {
    setIsLogin(false);
    setIsSignup(true);
  };

  return (
    <>
      <Collapse in={!isLogin} className="w-full ">
        <Collapse in={isSignup}>
          <div className="flex flex-col justify-center items-end w-full ">
            <button
              onClick={() => setIsSignup(false)}
              className="float-right mb-2"
            >
              <AiOutlineClose className="text-2xl text-gray-400" />
            </button>
          </div>
          <SignUpWithCasama onSuccess={onSuccess} />
        </Collapse>
        <Collapse in={!isSignup}>
          <div className="flex justify-center items-center ">
            <button
              onClick={() => setIsSignup(true)}
              className="btn-casama px-5 py-2 mb-5 font-medium max-w-xs w-full"
            >
              Sign Up
            </button>
          </div>
        </Collapse>
      </Collapse>
      <Collapse in={!isSignup} className="w-full ">
        <Collapse in={isLogin}>
          <div className="flex flex-col justify-center items-center w-full ">
            <div className="flex flex-col justify-center items-end w-full">
              <button
                onClick={() => setIsLogin(false)}
                className="float-right text-right mb-2"
              >
                <AiOutlineClose className="text-2xl  text-gray-400" />
              </button>{' '}
            </div>

            <LoginWithCasama
              onSuccess={onSuccess}
              toggleSignup={toggleSignup}
            />
          </div>
        </Collapse>
        <Collapse in={!isLogin}>
          <div className="flex justify-center items-center ">
            <button
              onClick={() => setIsLogin(true)}
              className="btn-casama-white items-center px-5 py-2 max-w-xs w-full"
            >
              Login
            </button>
          </div>
        </Collapse>
      </Collapse>
    </>
  );
}
