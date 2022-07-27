import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '/services/contract/pools';
import axios from 'axios';

export default function useUser() {
  const [wunderId, setWunderId] = useState(null);
  const [address, setAddress] = useState(null);
  const [usdBalance, setUsdBalance] = useState(null);
  const [topUpRequired, setTopUpRequired] = useState(null);
  const [pools, setPools] = useState([]);
  const [whitelistedPools, setWhitelistedPools] = useState([]);
  const [checkedTopUp, setCheckedTopUp] = useState(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const image = useMemo(
    () => `/api/proxy/users/getImage?wunderId=${wunderId}`,
    [wunderId]
  );

  const loggedIn = wunderId || address;

  const updateWunderId = (id) => {
    localStorage.setItem('wunderId', id);
    setWunderId(id);
  };

  const updateAddress = (addr) => {
    localStorage.setItem('address', addr);
    setAddress(addr);
  };

  const updateCheckedTopUp = (checked) => {
    localStorage.setItem('checkedTopUp', checked);
    setCheckedTopUp(checked);
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

  const fetchWhitelistedPools = () => {
    return new Promise((resolve, reject) => {
      if (!address) resolve(null);
      fetchWhitelistedUserPools(address)
        .then((pools) => {
          setWhitelistedPools(pools);
          resolve(pools);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const fetchUsdBalance = async () => {
    return new Promise((res, rej) => {
      usdcBalanceOf(address).then((balance) => {
        setUsdBalance(balance);
        if (balance < 1 && !checkedTopUp) {
          setTopUpRequired(true);
        }
        res(balance);
      });
    });
  };

  const addToDatabase = () => {
    if (!address || !wunderId) return;
    axios({
      method: 'POST',
      url: '/api/proxy/users/add',
      data: { wunderId: wunderId, address: address },
    });
  };

  const logOut = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('wunderId');
    localStorage.removeItem('checkedTopUp');
    setWunderId(null);
    setAddress(null);
    setCheckedTopUp(null);
    setPools([]);
    router.push('/');
  };

  useEffect(async () => {
    if (address) {
      await fetchUsdBalance();
      await fetchPools();
      await fetchWhitelistedPools();
      setIsReady(true);
    }
  }, [address]);

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
    setCheckedTopUp(localStorage.getItem('checkedTopUp') === 'true');
  }, []);

  return {
    wunderId,
    image,
    updateWunderId,
    address,
    updateAddress,
    loggedIn,
    logOut,
    pools,
    fetchPools,
    whitelistedPools,
    fetchWhitelistedPools,
    usdBalance,
    fetchUsdBalance,
    topUpRequired,
    setTopUpRequired,
    checkedTopUp,
    updateCheckedTopUp,
    isReady,
    addToDatabase,
  };
}
