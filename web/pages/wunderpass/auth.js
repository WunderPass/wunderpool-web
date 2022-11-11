import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function WunderPassAuth(props) {
  const { user, handleSuccess, handleError } = props;
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { address, wunderId } = router.query;
    if (address && wunderId) {
      handleSuccess(`Logged in as ${wunderId}`);
      user.updateWunderId(wunderId);
      user.updateAddress(address);
      router.push('/betting');
    } else {
      handleError('Log in failed');
      router.push('/');
    }
  }, [router.isReady]);

  return null;
}
