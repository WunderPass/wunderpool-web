import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import { fetchUserPools } from '/services/contract/pools';

export default function useUser() {
  const [wunderId, setWunderId] = useState(null);
  const [address, setAddress] = useState(null);
  const [usdBalance, setUsdBalance] = useState(null);
  const [topUpRequired, setTopUpRequired] = useState(null);
  const [pools, setPools] = useState([]);
  const [checkedTopUp, setCheckedTopUp] = useState(null);
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

  const fetchUsdBalance = () => {
    usdcBalanceOf(address).then((balance) => {
      setUsdBalance(balance);
      if (balance < 1 && !checkedTopUp) {
        setTopUpRequired(true);
      }
    });
  };

  const logOut = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('wunderId');
    setWunderId(null);
    setAddress(null);
    setCheckedTopUp(null);
    setPools([]);
    router.push('/');
  };

  useEffect(() => {
    if (address) {
      fetchPools();
      fetchUsdBalance();
    }
  }, [address]);

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
    setCheckedTopUp(localStorage.getItem('checkedTopUp'));
  }, []);

  return {
    wunderId,
    updateWunderId,
    address,
    updateAddress,
    loggedIn,
    logOut,
    pools,
    fetchPools,
    usdBalance,
    fetchUsdBalance,
    topUpRequired,
    setTopUpRequired,
  };
}
