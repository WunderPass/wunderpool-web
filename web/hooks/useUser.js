import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '/services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '/services/contract/pools';
import WalletConnectProvider from '@walletconnect/web3-provider';
import axios from 'axios';
import { fetchUserFriends } from '/services/memberHelpers';
import { decryptKey, retreiveKey } from '/services/crypto';
import { signMillis } from '/services/sign';
import { ethProvider } from '/services/contract/provider';
import useMetaMask from './useMetaMask';
import useWalletConnect from './useWalletConnect';

export default function useUser() {
  const [privateKey, setPrivateKey] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);

  const [wunderId, setWunderId] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [address, setAddress] = useState(null);
  const [userName, setUserName] = useState(null);
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
  const [notifications, setNotifications] = useState([]);
  const [checkedTopUp, setCheckedTopUp] = useState(null);
  const [confirmedBackup, setConfirmedBackup] = useState(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null);
  const [walletConnectMeta, setWalletConnectMeta] = useState({});

  const image = useMemo(
    () => `/api/users/getImage?wunderId=${wunderId}`,
    [wunderId]
  );

  // useEffect(async () => { //TODO
  //   if (!address) return;
  //   var name = await ethProvider.lookupAddress(address);
  //   if (name) setEnsName(name);
  // }, [ethProvider, address]);

  const loggedIn = wunderId || address;

  const updateWunderId = (id, forceReplace = false) => {
    if (forceReplace) {
      id
        ? localStorage.setItem('wunderId', id)
        : localStorage.removeItem('wunderId');
    } else {
      id && localStorage.setItem('wunderId', id);
    }
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

  const updateEmail = (email) => {
    email && localStorage.setItem('email', email);
    setEmail(email);
  };

  const updatePhoneNumber = (phoneNumber) => {
    phoneNumber && localStorage.setItem('phoneNumber', phoneNumber);
    setPhoneNumber(phoneNumber);
  };

  const updateFirstName = (firstName) => {
    firstName && localStorage.setItem('firstName', firstName);
    setFirstName(firstName);
  };

  const updateLastName = (lastName) => {
    lastName && localStorage.setItem('lastName', lastName);
    setLastName(lastName);
  };

  const updateUserName = (userName) => {
    userName && localStorage.setItem('userName', userName);
    setUserName(userName);
  };

  const fetchPools = (speedy = false) => {
    return new Promise((resolve, reject) => {
      if (!address) return;
      fetchUserPools(address, speedy)
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

  const fetchNotifications = async () => {
    try {
      const { data: rewards } = await axios({
        url: '/api/users/pendingRewards',
        params: { wunderId },
      });
      setNotifications(
        rewards.map(({ reward_type, description, reward_amount }) => ({
          type: reward_type,
          action: () => claimReward(reward_type, reward_amount),
          text: `Claim $${reward_amount} - "${description}"`,
          amount: reward_amount,
        }))
      );
    } catch (error) {
      console.log('Could not Load Notifications', error);
    }
  };

  const claimReward = async (type, amount) => {
    try {
      const { signedMessage, signature } = await getSignedMillis();
      await axios({
        url: '/api/users/claimReward',
        params: { type },
        headers: { signed: signedMessage, signature },
      });
      setUsdBalance((bal) => Number(bal) + amount || 0);
      setNotifications((notis) => notis.filter((noti) => noti.type != type));
    } catch (error) {
      console.log('Could not Claim Reward', error);
    }
  };

  const fetchUsdBalance = async () => {
    return new Promise((res, rej) => {
      usdcBalanceOf(address).then((balance) => {
        setUsdBalance(balance);
        res(balance);
      });
    });
  };

  const getUserData = async () => {
    if (firstName && lastName && email && phoneNumber && userName) return;
    if (!address) return;

    try {
      const { data: profile } = await axios({
        method: 'post',
        url: '/api/users/find',
        data: { address },
      });

      updateFirstName(profile?.firstname);
      updateLastName(profile?.lastname);
      updateUserName(profile?.handle);
      updateEmail(profile?.email);
      updatePhoneNumber(profile?.phone_number);
    } catch (error) {
      console.log('Could not Load Profile', error);
    }
  };

  const requestGas = (privKey = null) => {
    return new Promise((resolve, reject) => {
      try {
        if (privKey || privateKey) {
          const { signedMessage, signature } = signMillis(
            privKey || privateKey
          );
          const headers = { signed: signedMessage, signature: signature };
          axios({ url: '/api/users/requestGas', headers: headers })
            .then((res) => {
              resolve(res.data);
            })
            .catch((err) => {
              resolve(err);
            });
        } else {
          resolve(null);
        }
      } catch (error) {
        resolve(error);
      }
    });
  };

  const decryptKeyWithPassword = (password) => {
    const privKey = decryptKey(password, true);
    if (privKey) {
      setPasswordRequired(false);
      setPrivateKey(privKey);
    } else {
      throw 'Wrong Password';
    }
  };

  const getSignedMillis = () => {
    return new Promise((resolve, reject) => {
      if (loginMethod == 'Casama') {
        const savedKey = retreiveKey();
        if (savedKey) setPrivateKey(savedKey);

        if (privateKey || savedKey) {
          const data = signMillis(privateKey || savedKey);
          resolve(data);
        } else {
          setPasswordRequired(true);
          resolve({});
        }
      } else if (loginMethod == 'MetaMask') {
        const { signMillis } = useMetaMask();
        signMillis().then((data) => {
          resolve(data);
        });
      } else if (loginMethod == 'WalletConnect') {
        const { signMillis } = useWalletConnect();
        signMillis().then((data) => {
          resolve(data);
        });
      }
    });
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
    } else if (loginMethod == 'Casama') {
      const privKey = retreiveKey();
      setPasswordRequired(!Boolean(privKey));
      axios({
        url: '/api/users/recover/confirmedBackup',
        params: { identifier: wunderId || localStorage.getItem('wunderId') },
      })
        .then(({ data }) => {
          setConfirmedBackup(data.confirmed);
        })
        .catch(console.log);
    }
  }, [loginMethod]);

  useEffect(async () => {
    if (address) {
      await fetchUsdBalance();
      await fetchPools(router?.asPath != '/investing/pools');
      await fetchWhitelistedPools();
      await getUserData();
      setIsReady(true);
      if (!wunderId) {
        axios({
          method: 'POST',
          url: '/api/users/find',
          data: { address },
        })
          .then(({ data }) => {
            updateWunderId(data.wunder_id, true);
          })
          .catch((err) => {
            console.log('No User Found');
          });
      }
    }
  }, [address]);

  useEffect(() => {
    if (wunderId) {
      fetchNotifications();
      fetchFriends();
    }
  }, [wunderId]);

  useEffect(() => {
    if (!isReady) return;
    if (Number(usdBalance) < 1 && !checkedTopUp && notifications.length == 0) {
      setTopUpRequired(true);
    } else {
      setTopUpRequired(false);
    }
  }, [notifications, isReady, usdBalance]);

  useEffect(() => {
    if (router.asPath == '/investing/pools') {
      fetchPools();
      fetchWhitelistedPools();
    }
  }, [router.asPath]);

  useEffect(() => {
    setFirstName(localStorage.getItem('firstName'));
    setLastName(localStorage.getItem('lastName'));
    setUserName(localStorage.getItem('userName'));
    setEmail(localStorage.getItem('email'));
    setPhoneNumber(localStorage.getItem('phoneNumber'));
    setWunderId(localStorage.getItem('wunderId'));
    setAddress(localStorage.getItem('address'));
    setCheckedTopUp(localStorage.getItem('checkedTopUp') === 'true');
    setLoginMethod(localStorage.getItem('loginMethod'));
  }, []);

  return {
    wunderId,
    ensName,
    image,
    updateWunderId,
    address,
    firstName,
    lastName,
    userName,
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
    notifications,
    usdBalance,
    fetchUsdBalance,
    topUpRequired,
    setTopUpRequired,
    unsupportedChain,
    checkedTopUp,
    updateCheckedTopUp,
    confirmedBackup,
    isReady,
    decryptKeyWithPassword,
    getUserData,
    getSignedMillis,
    passwordRequired,
    requestGas,
  };
}
