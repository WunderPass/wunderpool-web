import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '/services/contract/pools';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';

export default function useUser() {
  const [wunderId, setWunderId] = useState(null);
  const [address, setAddress] = useState(null);
  const [usdBalance, setUsdBalance] = useState(null);
  const [topUpRequired, setTopUpRequired] = useState(null);
  const [unsupportedChain, setUnsupportedChain] = useState(false);
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
    window.walletConnect?.wc?.killSession();
    localStorage.removeItem('address');
    localStorage.removeItem('wunderId');
    localStorage.removeItem('checkedTopUp');
    localStorage.removeItem('loginMethod');
    setWunderId(null);
    setAddress(null);
    setCheckedTopUp(null);
    setLoginMethod(null);
    setUnsupportedChain(false);
    setPools([]);
    router.push('/');
  };

  useEffect(() => {
    if (loginMethod == 'MetaMask') {
      const metaMask = window.ethereum;
      setUnsupportedChain(metaMask?.chainId != '0x89');
      metaMask.on('accountsChanged', function ([newAddress]) {
        if (newAddress) {
          updateAddress(newAddress);
        } else {
          logOut();
        }
      });
      metaMask.on('networkChanged', function (networkId) {
        setUnsupportedChain(networkId != 137);
      });
    } else if (loginMethod == 'WalletConnect') {
      const wcProvider = new WalletConnectProvider({
        rpc: {
          137: 'https://polygon-rpc.com',
        },
        supportedChainIds: [137],
        chainId: 137,
        clientMeta: {
          name: 'Casma',
          description: 'Pool Crypto with your Friends',
          url: 'app.casama.io',
          icons: ['https://app.casama.io/casama_logo.png'],
        },
      });

      if (!window.walletConnect) {
        window.walletConnect = wcProvider;
      }

      wcProvider
        .enable()
        .then(([addr]) => {
          console.log(wcProvider.wc?.peerMeta);
          setUnsupportedChain(wcProvider.chainId != 137);
          wcProvider.on('accountsChanged', ([newAddress]) => {
            updateAddress(newAddress);
          });

          wcProvider.on('chainChanged', (chainId) => {
            setUnsupportedChain(chainId != 137);
          });

          wcProvider.on('disconnect', (code, reason) => {
            logOut();
          });
        })
        .catch(() => logOut());
    }
  }, [loginMethod]);

  useEffect(async () => {
    if (address) {
      await fetchUsdBalance();
      await fetchPools();
      await fetchWhitelistedPools();
      setIsReady(true);
      if (!wunderId) {
        axios({
          url: '/api/proxy/users/find',
          params: { address },
        })
          .then(({ data }) => {
            setWunderId(data.wunder_id);
          })
          .catch((err) => {
            console.log('No User Found');
          });
      }
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
    unsupportedChain,
    checkedTopUp,
    updateCheckedTopUp,
    isReady,
  };
}
