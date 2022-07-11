import { useRouter } from 'next/router';
import { useState } from 'react';
import usePool from '/hooks/usePool';

export default function JoinPool(props) {
  const router = useRouter();
  const { setupPoolListener, user } = props;
  const [address, setAddress] = useState(null);
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const wunderPool = usePool(user.address, address);

  const loginCallback = () => {
    setupPoolListener(address);
    router.push(`/pools/${address}?name=${wunderPool.poolName}`);
  };

  useEffect(() => {
    if (wunderPool.isReady && wunderPool.poolAddress) {
      if (wunderPool.exists) {
        if (wunderPool.isMember) {
          loginCallback();
          setLoading(false);
        }
      } else {
        router.push('/pools');
      }
    }
  }, [wunderPool.isReady, wunderPool.isMember]);

  useEffect(() => {
    if (wunderPool.liquidated) {
      router.push('/pools');
    }
  }, [wunderPool.liquidated]);

  useEffect(() => {
    if (router.isReady) {
      setAddress(router.query.address);
      setSecret(router.query.secret);
      wunderPool.setPoolAddress(router.query.address);
    }
  }, [router.isReady, router.query.address]);
}
