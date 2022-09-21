import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '/services/contract/pools';

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
  const [loginMethod, setLoginMethod] = useState(null);

  const image = useMemo(
    () => `/api/proxy/users/getImage?wunderId=${wunderId}`,
    [wunderId]
  );

  const loggedIn = wunderId || address;

  const updateWunderId = (id) => {
    id && localStorage.setItem('wunderId', id);
    setWunderId(id);
  };

  const updateAddress = (addr) => {
    addr && localStorage.setItem('address', addr);
    setAddress(addr);
  };

  const updateLoginMethod = (method) => {
    method && localStorage.setItem('loginMethod', method);
    setLoginMethod(method);
  };

  const updateCheckedTopUp = (checked) => {
    localStorage.setItem('checkedTopUp', checked);
    setCheckedTopUp(checked);
  };

  const fetchPools = () => {
    return new Promise((resolve, reject) => {
      if (!address) return;
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
      if (!address) return;
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

  const logOut = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('wunderId');
    localStorage.removeItem('checkedTopUp');
    localStorage.removeItem('loginMethod');
    setWunderId(null);
    setAddress(null);
    setCheckedTopUp(null);
    setLoginMethod(null);
    setPools([]);
    router.push('/');
  };

  useEffect(() => {
    const metaMask = window.ethereum;
    if (loginMethod == 'MetaMask') {
      metaMask.on('accountsChanged', function ([newAddress]) {
        if (newAddress) {
          updateAddress(newAddress);
        } else {
          logOut();
        }
      });
      metaMask.on('networkChanged', function (networkId) {
        console.log(networkId);
      });
    }
  }, [loginMethod]);

  useEffect(async () => {
    if (address) {
      await fetchUsdBalance();
      await fetchPools();
      await fetchWhitelistedPools();
      setIsReady(true);
    }
  }, [address]);

  useEffect(() => {
    if (router.asPath == '/pools') {
      fetchPools();
      fetchWhitelistedPools();
    }
  }, [router.asPath]);

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
    setCheckedTopUp(localStorage.getItem('checkedTopUp') === 'true');
    setLoginMethod(localStorage.getItem('loginMethod'));
  }, []);

  return {
    wunderId,
    image,
    updateWunderId,
    address,
    updateAddress,
    loginMethod,
    updateLoginMethod,
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
  };
}
