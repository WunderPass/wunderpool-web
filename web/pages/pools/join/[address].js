import { Container, Divider, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { currency, polyValueToUsd } from '/services/formatter';
import CurrencyInput from '/components/utils/currencyInput';
import usePool from '/hooks/usePool';
import { ethers } from 'ethers';
import { usdc } from '../../../services/formatter';
import LoginWithWunderPass from '../../../components/auth/loginWithWunderPass';

export default function JoinPool(props) {
  const router = useRouter();
  const { setupPoolListener, user, handleSuccess, handleInfo, handleError } =
    props;
  const [address, setAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const wunderPool = usePool(user.address, address);
  const { minInvest, maxInvest } = wunderPool;
  const price = wunderPool.governanceToken?.price || 0;
  const totalSupply = wunderPool.governanceToken?.totalSupply || 0;

  const receivedTokens =
    price > 0
      ? ethers.BigNumber.from(usdc(amount)).div(price)
      : ethers.BigNumber.from(100);

  const shareOfPool =
    totalSupply > 0
      ? receivedTokens.mul(100).div(totalSupply.add(receivedTokens))
      : ethers.BigNumber.from(100);

  const handleInput = (value, float) => {
    setAmount(value);
    if (float && minInvest > float) {
      setErrorMsg(
        `Minimum of ${currency(minInvest, {})} required for the Pool`
      );
    } else if (float && float > maxInvest) {
      setErrorMsg(`Maximum Invest of ${currency(maxInvest, {})} surpassed`);
    } else if (user.usdBalance < float) {
      setErrorMsg(`Not enough balance`);
    } else {
      setErrorMsg(null);
    }
  };

  const handleLogin = (data) => {
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

  const handleSubmit = () => {
    wunderPool
      .join(amount, secret)
      .then((res) => {
        handleSuccess(`Joined Pool with $ ${amount}`);
        loginCallback();
      })
      .catch((err) => {
        console.log(err);
        handleError('Could not join the Pool');
      });
  };

  const loginCallback = () => {
    // setupPoolListener(address);
    // router.push(`/pools/${address}?name=${wunderPool.poolName}`);
  };

  useEffect(() => {
    if (wunderPool.isReady && wunderPool.poolAddress) {
      if (wunderPool.exists) {
        if (wunderPool.isMember) {
          handleInfo('You already joined the Pool');
          loginCallback();
          setLoading(false);
        }
      } else {
        handleInfo('This Pool does not exist');
        router.push('/pools');
      }
    }
  }, [wunderPool.isReady, wunderPool.isMember]);

  useEffect(() => {
    if (wunderPool.liquidated) {
      handleInfo('This Pool was already liquidated');
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

  return (
    <Container className="flex justify-center items-center" maxWidth="xl">
      <div className="flex flex-col container-white items-center justify-center mt-6">
        <Typography className="text-md">Join Pool</Typography>
        <Typography className="text-2xl text-kaico-blue">
          {wunderPool.poolName}
        </Typography>
        <div className="flex flex-col md:flex-row items-center justify-center mt-6">
          <div className="flex flex-col items-center justify-center m-3">
            <Typography className="text-md">Minimum Invest</Typography>
            <Typography className="text-2xl text-kaico-blue">
              {currency(minInvest, {})}
            </Typography>
          </div>
          <div className="flex flex-col items-center justify-center m-3">
            <Typography className="text-md">Maximum Invest</Typography>
            <Typography className="text-2xl text-kaico-blue">
              {currency(maxInvest, {})}
            </Typography>
          </div>
          <div className="flex flex-col items-center justify-center m-3">
            <Typography className="text-md">Members</Typography>
            <Typography className="text-2xl text-kaico-blue">
              {`${wunderPool.governanceToken?.holders?.length || '-'} / ${
                wunderPool.maxMembers
              }`}
            </Typography>
          </div>
        </div>
        {user?.loggedIn ? (
          <>
            <div>
              <Typography className="text-sm mt-3">
                You will receive Governance Tokens proportionally to your invest
              </Typography>
              <Divider className="mt-2 mb-4 opacity-70" />
              <Typography>Invest Amount</Typography>
              <CurrencyInput
                value={amount}
                placeholder={currency(polyValueToUsd(minInvest, {}), {})}
                onChange={handleInput}
                error={errorMsg}
              />
              <Typography className="text-sm float-right mt-2">
                Estimated shares: {shareOfPool.toString()}%
              </Typography>
            </div>
            <button
              className="btn-kaico w-full py-3 mt-3"
              onClick={handleSubmit}
              disabled={!Boolean(amount) || Boolean(errorMsg)}
            >
              Join
            </button>
          </>
        ) : (
          <>
            <Typography className="text-sm mt-3">
              To join this Pool, you need a WunderPass Account
            </Typography>
            <Divider className="mt-2 mb-4 opacity-70" />
            <LoginWithWunderPass
              className="text-xs"
              name="WunderPool"
              redirect={'pools'}
              intent={['wunderId', 'address']}
              onSuccess={handleLogin}
            />
          </>
        )}
      </div>
    </Container>
  );
}
