import {
  Alert,
  AlertTitle,
  Container,
  Dialog,
  Divider,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { currency, polyValueToUsd } from '/services/formatter';
import CurrencyInput from '/components/utils/currencyInput';
import usePool from '/hooks/usePool';
import { ethers } from 'ethers';
import { usdc } from '/services/formatter';
import LoginWithWunderPass from '/components/auth/loginWithWunderPass';
import Link from 'next/link';

function InfoBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center m-3">
      <Typography className="text-md">{label}</Typography>
      <Typography className="text-2xl text-kaico-blue">{value}</Typography>
    </div>
  );
}

function PoolStats({
  minInvest,
  maxInvest,
  members,
  maxMembers,
  totalBalance,
}) {
  return (
    <div className="flex flex-wrap flex-row items-center justify-center w-full mt-6">
      {minInvest == maxInvest ? (
        <InfoBlock label="Required Invest" value={currency(minInvest, {})} />
      ) : (
        <>
          <InfoBlock label="Minimum Invest" value={currency(minInvest, {})} />
          <InfoBlock label="Maximum Invest" value={currency(maxInvest, {})} />
        </>
      )}
      <InfoBlock label="Total Assets" value={currency(totalBalance, {})} />
      <InfoBlock label="Members" value={`${members || '-'} / ${maxMembers}`} />
    </div>
  );
}

function NotLoggedIn({ handleLogin }) {
  return (
    <>
      <Typography className="text-sm mt-3">
        To join this Pool, you need a WunderPass Account
      </Typography>
      <Divider className="mt-2 mb-4 opacity-70" />
      <LoginWithWunderPass
        disablePopup
        className="text-xs"
        name="Casama"
        redirect={'pools'}
        intent={['wunderId', 'address']}
        onSuccess={handleLogin}
      />
    </>
  );
}

function TopUpRequired() {
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    setRedirectUrl(new URL(document.URL));
  }, []);

  return (
    <>
      <Typography className="text-sm mt-3">
        To continue, your Account needs at least $ 3.00
      </Typography>
      <Typography className="text-xl my-3">TopUp your WunderId</Typography>
      {redirectUrl && (
        <Link
          href={`${process.env.WUNDERPASS_URL}/balance/topUp?redirectUrl=${redirectUrl}`}
        >
          <button className="btn btn-info w-full">TopUp Now</button>
        </Link>
      )}
    </>
  );
}

function InputJoinAmount(props) {
  const {
    amount,
    minInvest,
    handleInput,
    errorMsg,
    shareOfPool,
    handleSubmit,
  } = props;

  return (
    <>
      <div>
        <Typography className="text-sm mt-3">
          You will receive Governance Tokens proportionally to your invest
        </Typography>
        <Divider className="mt-2 mb-4 opacity-70" />
        <Typography>Invest Amount</Typography>
        <CurrencyInput
          value={amount}
          placeholder={currency(minInvest, {})}
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
  );
}

export default function JoinPool(props) {
  const router = useRouter();
  const { setupPoolListener, user, handleSuccess, handleInfo, handleError } =
    props;
  const [address, setAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState(null);
  const [signing, setSigning] = useState(false);
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
    wunderPool.updateUserAddress(data.address);
  };

  const handleSubmit = () => {
    setSigning(true);
    setTimeout(() => {
      wunderPool
        .join(amount, secret)
        .then(() => {
          user.fetchUsdBalance();
          handleSuccess(`Joined Pool with $${currency(amount, {})}`);
          loginCallback();
        })
        .catch((err) => {
          console.log(err);
          handleError('Could not join the Pool');
        });
    }, 10);
  };

  const loginCallback = () => {
    setupPoolListener(address, user.address);
    router.push(`/pools/${address}?name=${wunderPool.poolName}`);
  };

  useEffect(() => {
    if (wunderPool.isReady && wunderPool.poolAddress) {
      if (wunderPool.exists) {
        if (wunderPool.isMember) {
          handleInfo('You already joined the Pool');
          loginCallback();
        }
      } else if (wunderPool.exists === false) {
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
      wunderPool.setUserAddress(user.address);
    }
  }, [router.isReady, router.query.address]);

  return (
    <Container className="flex justify-center items-center" maxWidth="xl">
      <div className="flex flex-col container-white items-center justify-center mt-6">
        <Typography className="text-md">Join Pool</Typography>
        <Typography className="text-2xl text-kaico-blue">
          {wunderPool.poolName}
        </Typography>
        <PoolStats
          minInvest={minInvest}
          maxInvest={maxInvest}
          members={wunderPool.governanceToken?.holders?.length}
          maxMembers={wunderPool.maxMembers}
          totalBalance={wunderPool.totalBalance}
        />
        {wunderPool.closed && (
          <Alert severity="warning" className="w-full">
            This Pool is already closed
          </Alert>
        )}
        {user?.loggedIn ? (
          user?.usdBalance < 3 ? (
            <TopUpRequired />
          ) : (
            <InputJoinAmount
              amount={amount}
              minInvest={minInvest}
              handleInput={handleInput}
              errorMsg={errorMsg}
              shareOfPool={shareOfPool}
              handleSubmit={handleSubmit}
            />
          )
        ) : (
          <NotLoggedIn handleLogin={handleLogin} />
        )}
      </div>
      <Dialog
        open={signing}
        onClose={() => {
          setSigning(false);
        }}
        PaperProps={{
          style: { borderRadius: 12 },
        }}
      >
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height="500"
        ></iframe>
      </Dialog>
    </Container>
  );
}
