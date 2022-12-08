import { Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmailVerificationCard({
  wunderIdsNotified,
  user,
  handleSuccess,
  handleError,
}) {
  const [verificationMailSent, setVerificationMailSent] = useState(true);

  const handleVerificationRequest = async () => {
    try {
      const { signedMessage, signature } = await user.getSignedMillis();
      await axios({
        url: '/api/users/verify/requestMail',
        params: { wunderId: user.wunderId },
        headers: { signed: signedMessage, signature },
      });
      setVerificationMailSent(true);
      handleSuccess('Email has been sent!');
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (!user.wunderId) return;
    setVerificationMailSent(wunderIdsNotified.includes(user.wunderId));
  }, [user.wunderId]);

  return (
    <div className="container-white my-5">
      <div className="text-left w-full ">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-lg p-1 font-semibold">Verify your Email</h3>
        </div>
        <Divider className="w-full mt-2 mb-4" />
        <p className="">
          As an early user of Casama, we will give you a bonus of{' '}
          <span className="text-casama-blue">$ 5.00</span>.
        </p>
        <div className="w-full">
          <button
            disabled={!user.email || verificationMailSent}
            onClick={handleVerificationRequest}
            className="btn-casama px-5 py-2 block mx-auto mt-3"
          >
            {verificationMailSent
              ? 'Check your Inbox'
              : user.email
              ? 'Verify Email'
              : 'Please update your Email above'}
          </button>
        </div>
      </div>
    </div>
  );
}
