import { UsersRewardsGetCodeResponse } from './../pages/api/users/rewards/getCode';
import { FormattedUser } from './../services/memberHelpers';
import { FormattedPool, WhitelistedPool } from './../services/contract/pools';
import { SupportedChain } from './../services/contract/types';
import { UserRewardsResponse } from './../pages/api/users/rewards/pending';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { usdcBalanceOf } from '../services/contract/token';
import {
  fetchUserPools,
  fetchWhitelistedUserPools,
} from '../services/contract/pools';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { IClientMeta } from '@walletconnect/types';
import axios from 'axios';
import { fetchUserFriends } from '../services/memberHelpers';
import {
  decryptKey,
  retreiveKey,
  addressFromPrivate,
} from '../services/crypto';
import { signMillis } from '../services/sign';
import useMetaMask from './useMetaMask';
import useWalletConnect from './useWalletConnect';

const admins = [
  '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
  '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
  '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
  '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
  '0x466274eefdd3265e3d8085933e69890f33023048', // Max
  '0x3c782466d0560b05928515cf31def4ff308b947a', // Max2
];

export type LoginMethod = 'Casama' | 'MetaMask' | 'WalletConnect';

type UserNotification = {
  type: string;
  action: () => void;
  text: string;
  amount: number;
};

export type UseUserType = {
  wunderId: string;
  image: string;
  updateWunderId: (id: string, forceReplace?: boolean) => void;
  address: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  updateAddress: (addr: string) => void;
  loginMethod: LoginMethod;
  updateLoginMethod: (method: LoginMethod) => void;
  walletConnectMeta: IClientMeta;
  loggedIn: boolean;
  logOut: () => void;
  pools: FormattedPool[];
  fetchPools: (speedy?: boolean) => Promise<FormattedPool[]>;
  friends: FormattedUser[];
  referrerId: string;
  fetchFriends: () => void;
  whitelistedPools: WhitelistedPool[];
  fetchWhitelistedPools: () => Promise<WhitelistedPool[]>;
  notifications: UserNotification[];
  usdBalance: number;
  fetchUsdBalance: (chain?: SupportedChain) => Promise<number>;
  topUpRequired: boolean;
  setTopUpRequired: Dispatch<SetStateAction<boolean>>;
  preferredChain: SupportedChain;
  updatePreferredChain: (chain: SupportedChain) => void;
  unsupportedChain: boolean;
  checkedTopUp: boolean;
  updateCheckedTopUp: (checked: boolean) => void;
  confirmedBackup: boolean;
  isReady: boolean;
  isAdmin: boolean;
  decryptKeyWithPassword: (password: string) => void;
  getUserData: () => void;
  getSignedMillis: () => Promise<{
    signedMessage: number;
    signature: string;
  }>;
  passwordRequired: boolean;
  requestGas: (privKey?: any) => Promise<any>;
  fetchNotifications: () => void;
};

export default function useUser(): UseUserType {
  const [privateKey, setPrivateKey] = useState<string>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);

  const [wunderId, setWunderId] = useState<string>(null);
  const [address, setAddress] = useState(null);
  const [userName, setUserName] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usdBalance, setUsdBalance] = useState<number>(null);
  const [topUpRequired, setTopUpRequired] = useState<boolean>(null);
  const [preferredChain, setPreferredChain] = useState<SupportedChain>();
  const [unsupportedChain, setUnsupportedChain] = useState(false);
  const [friends, setFriends] = useState<FormattedUser[]>([]);
  const [referrerId, setReferrerId] = useState('');
  const [pools, setPools] = useState<FormattedPool[]>([]);
  const [whitelistedPools, setWhitelistedPools] = useState<WhitelistedPool[]>(
    []
  );

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [checkedTopUp, setCheckedTopUp] = useState<boolean>(null);
  const [confirmedBackup, setConfirmedBackup] = useState<boolean>(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [walletConnectMeta, setWalletConnectMeta] = useState<IClientMeta>();

  const image = useMemo(
    () => `/api/users/getImage?wunderId=${wunderId}`,
    [wunderId]
  );

  const loggedIn = wunderId || address;

  const updateWunderId = (id: string, forceReplace = false) => {
    if (forceReplace) {
      id
        ? localStorage.setItem('wunderId', id)
        : localStorage.removeItem('wunderId');
    } else {
      id && localStorage.setItem('wunderId', id);
    }
    setWunderId(id);
  };

  const updateAddress = (addr: string) => {
    addr && localStorage.setItem('address', addr);
    setAddress(addr);
  };

  const updateLoginMethod = (method: LoginMethod) => {
    method && localStorage.setItem('loginMethod', method);
    setLoginMethod(method);
  };

  const updateCheckedTopUp = (checked: boolean) => {
    localStorage.setItem('checkedTopUp', checked ? 'true' : 'false');
    setCheckedTopUp(checked);
  };

  const updateEmail = (email: string) => {
    email && localStorage.setItem('email', email);
    setEmail(email);
  };

  const updatePhoneNumber = (phoneNumber: string) => {
    phoneNumber && localStorage.setItem('phoneNumber', phoneNumber);
    setPhoneNumber(phoneNumber);
  };

  const updateFirstName = (firstName: string) => {
    firstName && localStorage.setItem('firstName', firstName);
    setFirstName(firstName);
  };

  const updateLastName = (lastName: string) => {
    lastName && localStorage.setItem('lastName', lastName);
    setLastName(lastName);
  };

  const updateUserName = (userName: string) => {
    userName && localStorage.setItem('userName', userName);
    setUserName(userName);
  };

  const updatePreferredChain = (chain: SupportedChain) => {
    chain && localStorage.setItem('preferredChain', chain);
    setPreferredChain(chain);
  };

  const fetchPools = async (speedy = false) => {
    if (!address) return;
    try {
      const ps = await fetchUserPools(address, preferredChain, speedy);
      setPools(ps);
      return ps;
    } catch (error) {
      throw error;
    }
  };

  const fetchWhitelistedPools = async () => {
    if (!address) return;
    try {
      const wps = await fetchWhitelistedUserPools(address);
      setWhitelistedPools(wps);
      return wps;
    } catch (error) {
      throw error;
    }
  };

  const fetchFriends = async () => {
    try {
      setFriends(await fetchUserFriends(wunderId));
    } catch (error) {}
  };

  const fetchNotifications = async () => {
    try {
      const { data: rewards }: { data: UserRewardsResponse } = await axios({
        url: '/api/users/rewards/pending',
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

  const getReferrerCode = async () => {
    if (loginMethod !== 'Casama') return;
    try {
      const { signedMessage, signature } = await getSignedMillis();

      const { data }: { data: UsersRewardsGetCodeResponse } = await axios({
        url: '/api/users/rewards/getCode',
        params: { wunderId },
        headers: { signed: `${signedMessage}`, signature },
      });

      setReferrerId(data.code);
    } catch (error) {
      console.log('Could not Load Notifications', error);
    }
  };

  const claimReward = async (type: string, amount: number) => {
    try {
      const { signedMessage, signature } = await getSignedMillis();
      await axios({
        url: '/api/users/rewards/claim',
        params: { type },
        headers: { signed: `${signedMessage}`, signature },
      });
      setUsdBalance((bal) => Number(bal) + amount || 0);
      setNotifications((notis) => notis.filter((noti) => noti.type != type));
    } catch (error) {
      console.log('Could not Claim Reward', error);
    }
  };

  const fetchUsdBalance = async (chain?: SupportedChain) => {
    const balance = await usdcBalanceOf(address, chain || preferredChain);
    setUsdBalance(balance);
    return balance;
  };

  const getUserData = async () => {
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

  const requestGas = async (privKey = null) => {
    try {
      if (privKey || privateKey) {
        const { signedMessage, signature } = signMillis(privKey || privateKey);
        const headers = { signed: `${signedMessage}`, signature: signature };
        try {
          const { data }: { data: string } = await axios({
            url: '/api/users/requestGas',
            headers: headers,
          });
          return data;
        } catch (err) {
          if (axios.isAxiosError(err)) {
            return err.response.data;
          }
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      return error;
    }
  };

  const decryptKeyWithPassword = (password: string) => {
    const privKey = decryptKey(password, true);
    if (privKey) {
      setPasswordRequired(false);
      setPrivateKey(privKey);
    } else {
      throw 'Wrong Password';
    }
  };

  const getSignedMillis = async () => {
    if (loginMethod == 'Casama') {
      const savedKey = retreiveKey();
      if (savedKey) setPrivateKey(savedKey);

      if (privateKey || savedKey) {
        const data = signMillis(privateKey || savedKey);
        return data;
      } else {
        setPasswordRequired(true);
        return { signedMessage: undefined, signature: undefined };
      }
    } else if (loginMethod == 'MetaMask') {
      const { signMillis } = useMetaMask();
      return await signMillis();
    } else if (loginMethod == 'WalletConnect') {
      const { signMillis } = useWalletConnect();
      return await signMillis();
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
    if ((window as any).walletConnect?.wc?.connected)
      (window as any).walletConnect?.wc?.killSession();
    (window as any).walletConnect = undefined;
    router.push('/');
  };

  useEffect(() => {
    if (loginMethod == 'MetaMask') {
      setTimeout(
        () => {
          setUnsupportedChain(
            (window as any).ethereum?.chainId
              ? !['0x89', '0x64'].includes((window as any).ethereum?.chainId)
              : false
          );
          updatePreferredChain(
            (window as any).ethereum?.chainId == '0x89' ? 'polygon' : 'gnosis'
          );
        },
        (window as any).ethereum?.chainId ? 0 : 1000
      );

      (window as any).ethereum.on('accountsChanged', function ([newAddress]) {
        if (newAddress) {
          updateAddress(newAddress);
        } else {
          logOut();
        }
      });
      (window as any).ethereum.on(
        'networkChanged',
        function (networkId: number) {
          setUnsupportedChain(false);
          if (networkId == 137) {
            updatePreferredChain('polygon');
          } else if (networkId == 100) {
            updatePreferredChain('gnosis');
          } else {
            setUnsupportedChain(true);
          }
        }
      );
    } else if (loginMethod == 'WalletConnect') {
      const wcProvider = new WalletConnectProvider({
        rpc: {
          100: 'https://rpc.gnosischain.com',
          137: 'https://polygon-rpc.com',
        },
        chainId: 100,
      });

      if (!(window as any).walletConnect) {
        (window as any).walletConnect = wcProvider;
      }

      wcProvider
        .enable()
        .then(([addr]) => {
          setWalletConnectMeta(wcProvider.wc?.peerMeta);
          setUnsupportedChain(![100, 137].includes(wcProvider.chainId));
          updatePreferredChain(
            wcProvider.chainId == 137 ? 'polygon' : 'gnosis'
          );
          wcProvider.on('accountsChanged', ([newAddress]) => {
            updateAddress(newAddress);
          });

          wcProvider.on('chainChanged', (chainId) => {
            setUnsupportedChain(false);
            if (chainId == 137) {
              updatePreferredChain('polygon');
            } else if (chainId == 100) {
              updatePreferredChain('gnosis');
            } else {
              setUnsupportedChain(true);
            }
          });

          wcProvider.on('disconnect', (code, reason) => {
            logOut();
          });
        })
        .catch(() => logOut());
    } else if (loginMethod == 'Casama') {
      const privKey = retreiveKey();
      setIsAdmin(admins.includes(addressFromPrivate(privKey).toLowerCase()));
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

  const handleAddressChanged = async () => {
    if (address) {
      await getReferrerCode();
      await fetchUsdBalance(preferredChain);
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
  };

  const handleChainChanged = async () => {
    if (preferredChain) {
      await fetchUsdBalance(preferredChain);
    }
  };

  useEffect(() => {
    handleChainChanged();
  }, [preferredChain]);

  useEffect(() => {
    handleAddressChanged();
  }, [address]);

  useEffect(() => {
    if (wunderId) {
      fetchNotifications();
      fetchFriends();
    }
  }, [wunderId]);

  useEffect(() => {
    if (!isReady) return;
    setTopUpRequired(false);
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
    setLoginMethod(localStorage.getItem('loginMethod') as LoginMethod);
    setPreferredChain(
      (localStorage.getItem('preferredChain') as SupportedChain) || 'gnosis'
    );
  }, []);

  return {
    wunderId,
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
    referrerId,
    fetchFriends,
    whitelistedPools,
    fetchWhitelistedPools,
    notifications,
    usdBalance,
    fetchUsdBalance,
    topUpRequired,
    setTopUpRequired,
    preferredChain,
    updatePreferredChain,
    unsupportedChain,
    checkedTopUp,
    updateCheckedTopUp,
    confirmedBackup,
    isReady,
    isAdmin,
    decryptKeyWithPassword,
    getUserData,
    getSignedMillis,
    passwordRequired,
    requestGas,
    fetchNotifications,
  };
}
