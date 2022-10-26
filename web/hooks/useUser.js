import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '/services/contract/pools';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import { fetchUserFriends } from '../services/memberHelpers';
import { publicFromPrivate, decryptKey, retreiveKey } from '/services/crypto';
import { signMillis, signMessage } from '/services/sign';

export default function useUser() {
  const [privateKey, setPrivateKey] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false); //TODO this needs to be checked and implemented properly

  const [wunderId, setWunderId] = useState(null);
  const [address, setAddress] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usdBalance, setUsdBalance] = useState(null);
  const [topUpRequired, setTopUpRequired] = useState(null);
  const [unsupportedChain, setUnsupportedChain] = useState(false);
  const [friends, setFriends] = useState([]);
  const [pools, setPools] = useState([]);
  const [whitelistedPools, setWhitelistedPools] = useState([]);
  const [checkedTopUp, setCheckedTopUp] = useState(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);
  const [walletConnectMeta, setWalletConnectMeta] = useState({});

  const image = useMemo(
    () => `/api/users/getImage?wunderId=${wunderId}`,
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

  const fetchFriends = async () => {
    try {
      setFriends(await fetchUserFriends(wunderId));
    } catch (error) {
      console.log('Could not Load Friends', error);
    }
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

  const getUserData = async () => {
    const { signedMessage, signature } = getSignedMillis() || {};
    console.log('succesfully entered after getSignedMilis');
    console.log('signature,', signature);
    console.log('signedMessage,', signedMessage);

    if (!signature) return;
    console.log('succesfully entered after !signature');

    try {
      const profile = (
        await axios({
          method: 'get',
          url: '/api/users/getProfile',
          headers: {
            signature: signature,
            signed: signedMessage,
          },
          data: { wunderId },
        })
      ).data;

      setEmail(profile?.email);
      if (profile?.email) localStorage.setItem('email', profile?.email);
      setPhoneNumber(profile?.phone_number);
      setFirstName(profile?.firstname);
      setLastName(profile?.lastname);
      if (profile?.phone_number)
        localStorage.setItem('phoneNumber', profile?.phone_number);
      console.log('profile in useuser getUserdata', profile);
    } catch (error) {
      console.log('Could not Load Profile', error);
    }
  };

  const decrypt = (password, save = false) => {
    console.log('succesfully entered in decrypt');

    const privKey = decryptKey(password, save);
    if (privKey) {
      setPasswordRequired(false);
      setPrivateKey(privKey);
    } else {
      throw 'Wrong Password';
    }
  };

  const getSignedMillis = () => {
    console.log('enter in getSigned>Millis');
    const savedKey = retreiveKey();
    console.log('enter in getSigned>Millis after retreiveKey');

    if (savedKey) setPrivateKey(savedKey);
    console.log('savedKey', savedKey);
    console.log('privateKey', privateKey);

    if (privateKey || savedKey) {
      const { signedMessage, signature } = signMillis(privateKey || savedKey);
      return { signedMessage, signature };
    } else {
      //setPasswordRequired(true); //TODO
      return;
    }
  };

  const decryptAndSign = (password, data) => {
    const privKey = decryptKey(password);
    if (privKey) {
      return signMessage(privKey, data);
    } else {
      throw 'Wrong Password';
    }
  };

  const logOut = () => {
    localStorage.clear();
    setPrivateKey(null);
    setWunderId(null);
    setAddress(null);
    setFirstName(null);
    setLastName(null);
    setEmail(null);
    setPhoneNumber(null);
    setCheckedTopUp(null);
    setLoginMethod(null);
    setUnsupportedChain(false);
    setPools([]);
    setPasswordRequired(false);
    if (window.walletConnect?.wc?.connected)
      window.walletConnect?.wc?.killSession();
    window.walletConnect = undefined;
    router.push('/');
  };

  useEffect(() => {
    if (loginMethod == 'MetaMask') {
      setTimeout(
        () => {
          setUnsupportedChain(
            window.ethereum?.chainId
              ? window.ethereum?.chainId != '0x89'
              : false
          );
        },
        window.ethereum?.chainId ? 0 : 1000
      );

      window.ethereum.on('accountsChanged', function ([newAddress]) {
        if (newAddress) {
          updateAddress(newAddress);
        } else {
          logOut();
        }
      });
      window.ethereum.on('networkChanged', function (networkId) {
        setUnsupportedChain(networkId != 137);
      });
    } else if (loginMethod == 'WalletConnect') {
      const wcProvider = new WalletConnectProvider({
        rpc: {
          137: 'https://polygon-rpc.com',
        },
        supportedChainIds: [137],
        chainId: 137,
      });

      if (!window.walletConnect) {
        window.walletConnect = wcProvider;
      }

      wcProvider
        .enable()
        .then(([addr]) => {
          setWalletConnectMeta(wcProvider.wc?.peerMeta);
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
      await fetchFriends();
      setIsReady(true);
      if (!wunderId) {
        axios({
          method: 'POST',
          url: '/api/users/find',
          data: { address },
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
    console.log('entered in router.isReady');
    if (!router.isReady) return;
    console.log('entered in router.isReady after if');

    setEmail(localStorage.getItem('email'));
    setPhoneNumber(localStorage.getItem('phoneNumber'));
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
  }, [router.isReady]);

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
    setCheckedTopUp(localStorage.getItem('checkedTopUp') === 'true');
    setLoginMethod(localStorage.getItem('loginMethod'));
  }, []);

  useEffect(() => {
    //TO BE TESTED
    console.log('useffect for  getUserdata passwordRequired', passwordRequired);
    console.log('useffect for getUserData !wunderId', !wunderId);
    console.log(
      'useffect for getUserData phoneNumber && email',
      phoneNumber && email
    );

    //if (passwordRequired || !wunderId || (phoneNumber && email)) return;
    console.log('entered in useffect for getUserData');
    getUserData();
  }, [wunderId, passwordRequired]);

  return {
    wunderId,
    image,
    updateWunderId,
    address,
    firstName,
    lastName,
    email,
    phoneNumber,
    updateAddress,
    loginMethod,
    updateLoginMethod,
    walletConnectMeta,
    loggedIn,
    logOut,
    pools,
    fetchPools,
    friends,
    fetchFriends,
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
    decrypt,
    getUserData,
    getSignedMillis,
    setPasswordRequired,
    setPrivateKey,
    decryptAndSign,
  };
}
