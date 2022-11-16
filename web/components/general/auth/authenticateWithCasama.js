import { Collapse } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import LoginWithCasama from './loginWithCasama';
import SignUpWithCasama from './signupWithCasama';

export default function AuthenticateWithCasama({ onSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleSignup = () => {
    setIsLogin(false);
    setIsSignup(true);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading)
    return (
      <>
        <button
          onClick={() => setIsSignup(true)}
          className="w-fit mx-auto flex text-center items-center justify-center bg-casama-blue hover:bg-casama-dark-blue rounded-lg px-5 py-2 font-medium text-md"
        >
          <p className="pl-2 lg:pl-3 p-1 text-white">Sign Up with Email</p>
        </button>
        <button
          onClick={() => setIsLogin(true)}
          className="w-fit my-2 mx-auto flex text-center items-center justify-center text-casama-blue border-casama-blue border-2 rounded-lg px-5 py-2 text-md"
        >
          <p className="pl-2 lg:pl-3 p-1">Login with Seed Phrase</p>
        </button>
      </>
    );

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
            </button>{' '}
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
