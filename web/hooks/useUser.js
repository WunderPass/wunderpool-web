import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchUserPools } from '/services/contract/pools';

export default function useUser() {
  const [wunderId, setWunderId] = useState(null);
  const [address, setAddress] = useState(null);
  const [pools, setPools] = useState([]);
  const router = useRouter();

  const loggedIn = wunderId || address;

  const updateWunderId = (id) => {
    localStorage.setItem('wunderId', id);
    setWunderId(id);
  };

  const updateAddress = (addr) => {
    localStorage.setItem('address', addr);
    setAddress(addr);
  };

  const fetchPools = () => {
    return new Promise((resolve, reject) => {
      if (!address) resolve(null);
      fetchUserPools(address)
        .then((pools) => {
          setPools(pools);
          resolve(pools);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const logOut = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('wunderId');
    setWunderId(null);
    setAddress(null);
    setPools([]);
    router.push('/');
  };

  useEffect(() => {
    if (address) {
      fetchPools();
    }
  }, [address]);

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
  }, []);

  return {
    wunderId,
    address,
    updateWunderId,
    updateAddress,
    logOut,
    loggedIn,
    pools,
    fetchPools,
  };
}
