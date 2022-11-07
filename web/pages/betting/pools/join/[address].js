import { Alert, Container, Divider, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';
import CurrencyInput from '/components/general/utils/currencyInput';
import usePool from '/hooks/usePool';
import useGame from '/hooks/useGame';
import { toFixed } from '/services/formatter';
import TransactionDialog from '/components/general/utils/transactionDialog';
import CustomHeader from '/components/general/utils/customHeader';
import { fetchPoolData } from '/services/contract/pools';
import Avatar from '/components/general/members/avatar';
import { getNameFor } from '/services/memberHelpers';
import LoginWithMetaMask from '/components/general/auth/loginWithMetaMask';
import LoginWithWalletConnect from '/components/general/auth/loginWithWalletConnect';
import AuthenticateWithCasama from '/components/general/auth/authenticateWithCasama';
import DashboardGameCard from '/components/betting/games/dashboardGameCard';

export default function JoinPool(props) {
  const router = useRouter();
  const {
    updateListener,
    user,
    metaTagInfo,
    handleSuccess,
    handleInfo,
    handleError,
    bettingService,
  } = props;
  const [address, setAddress] = useState(null);
  const [amount, setAmount] = useState('');
  const [secret, setSecret] = useState(null);
  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [invalidLink, setInvalidLink] = useState(false);
  const wunderPool = usePool(user.address, address, handleError);
  const game = useGame(27, user); //TODO

  const handleInput = (value, float) => {
    setAmount(value);
    if (float && minInvest > float) {
      setErrorMsg(`Minimum of ${currency(minInvest)} required for the Pool`);
    } else if (float && float > maxInvest) {
      setErrorMsg(`Maximum Invest of ${currency(maxInvest)} surpassed`);
    } else if (user.usdBalance < float) {
      setErrorMsg(`Not enough balance`);
    } else {
      setErrorMsg(null);
    }
  };

  console.log('betting', bettingService);
  console.log('game', game);

  const handleLogin = (data) => {
    user.updateLoginMethod(data.loginMethod);
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
          handleSuccess(`Joined Pool with ${currency(amount)}`);
          loginCallback();
        })
        .catch((err) => {
          setSigning(false);
          if (err == 'Not On Whitelist') setInvalidLink(true);
          handleError(
            `Could not join the Pool${typeof err == 'string' ? `: ${err}` : ''}`
          );
        });
    }, 10);
  };

  const loginCallback = () => {
    router.push(`/betting/bets?sortId=${game.game.id}`); //ad sortId in for bets (check /pools?sortId=27)
  };

  console.log('game', game);
  console.log('game is partiicpant', game.isParticipant);

  useEffect(() => {
    if (game.isReady) {
      if (game.exists) {
        if (game.isParticipant) {
          handleInfo('You already placed a bet for this game');
          loginCallback();
        }
      } else {
        handleInfo('This Bet does not exist');
        router.push('/betting/pools');
      }
    }
  }, [game.isReady, game.isParticipant]);

  // TODO ADD IF BET IS ALREDY FINISHED AN NOT AVAILABLE FOR VOTES
  // useEffect(() => {
  //   if (wunderPool.liquidated) {
  //     handleInfo('This Bet is already resolved');
  //     router.push('/betting/pools');
  //   }
  // }, [wunderPool.liquidated]);

  return (
    <>
      <CustomHeader
        title={metaTagInfo.title}
        description={metaTagInfo.description}
        imageUrl={metaTagInfo.imageUrl}
      />
      <Container
        className="flex flex-col justify-center items-center gap-3"
        maxWidth="xl"
      >
        <div className="flex flex-col justify-center items-center  w-full container-gray mt-7">
          {wunderPool.closed && (
            <Alert severity="warning" className="w-full items-center my-1">
              This Pool is already closed
            </Alert>
          )}
          {invalidLink && (
            <Alert severity="error" className="w-full items-center my-1">
              This Link has most likely expired. Please ask the Pool Members for
              a new Link
            </Alert>
          )}
          {user?.loggedIn ? (
            user?.usdBalance < 3 ? (
              <TopUpRequired {...props} />
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
            <NotLoggedIn handleLogin={handleLogin} handleError={handleError} />
          )}
        </div>
        {game.isReady && (
          <div className="flex flex-col my-8 w-full ">
            <DashboardGameCard
              key={`dashboard-game-card-${game.game.id}`}
              game={game.game}
              user={user}
              {...props}
            />
            <div className="flex container-gray w-full">dadaw</div>
          </div>
        )}

        {/* <TransactionDialog
          open={signing}
          onClose={() => {
            setSigning(false);
          }}
        /> */}
      </Container>
    </>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center m-3">
      <Typography className="text-md">{label}</Typography>
      <Typography className="text-2xl text-casama-blue">{value}</Typography>
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
        <InfoBlock label="Required Invest" value={currency(minInvest)} />
      ) : (
        <>
          <InfoBlock label="Minimum Invest" value={currency(minInvest)} />
          <InfoBlock label="Maximum Invest" value={currency(maxInvest)} />
        </>
      )}
      <InfoBlock label="Total Assets" value={currency(totalBalance)} />
      <InfoBlock label="Members" value={`${members || '-'} / ${maxMembers}`} />
    </div>
  );
}

function NotLoggedIn({ handleLogin, handleError }) {
  return (
    <>
      <Typography className="text-sm">
        Create an Account to join this Pool
      </Typography>
      <Divider className="mt-2 mb-4 opacity-70" />
      <AuthenticateWithCasama onSuccess={handleLogin} />
      <p className="text-gray-400 text-sm my-2 mb-1 lg:mb-1 mt-8">
        Already have a wallet?
      </p>
      <div className="max-w-sm">
        <LoginWithMetaMask onSuccess={handleLogin} handleError={handleError} />
        <LoginWithWalletConnect
          onSuccess={handleLogin}
          handleError={handleError}
        />
      </div>
    </>
  );
}

function TopUpRequired(props) {
  const { user } = props;
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    setRedirectUrl(new URL(document.URL));
  }, []);

  return (
    <>
      <Typography className="text-sm mt-3">
        To continue, your Account needs at least $3.00
      </Typography>
      <Typography className="text-xl my-3">
        Deposit funds to your wallet
      </Typography>
      {redirectUrl && (
        <a
          className="w-full"
          href={`${process.env.TRANSAK_URL}${process.env.TRANSAK_API_KEY}&productsAvailed=BUY&network=polygon&cryptoCurrencyCode=USDC&walletAddress=${user.address}&defaultCryptoAmount=50&redirectURL=https://app.wunderpass.org/balance`}
          target="_blank"
        >
          <button className="btn-casama p-3 w-full">Deposit now</button>
        </a>
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
        <Typography>
          Invest Amount
          <span className="text-gray-500 text-xs ml-2">
            (Fee of 4.9% applies)
          </span>
        </Typography>
        <CurrencyInput
          value={amount}
          placeholder={currency(minInvest)}
          onChange={handleInput}
          error={errorMsg}
        />
        <Typography className="text-sm float-right mt-2">
          Estimated shares: {toFixed(shareOfPool, 2)}%
        </Typography>
      </div>
      <button
        className="btn-casama w-full py-3 mt-3"
        onClick={handleSubmit}
        disabled={!Boolean(amount) || Boolean(errorMsg)}
      >
        Join
      </button>
    </>
  );
}

export async function getServerSideProps(context) {
  const address = context.query.address;

  try {
    const {
      pool_name,
      pool_description,
      pool_treasury,
      pool_members,
      shareholder_agreement,
    } = await (
      await fetch(`https://app.casama.io/api/pools/show?address=${address}`)
    ).json();

    const balance = currency(pool_treasury.act_balance);

    return {
      props: {
        metaTagInfo: {
          title: `Casama - ${pool_name} - ${balance}`,
          description: pool_description,
          imageUrl: `/api/pools/metadata/ogImage?address=${address}&name=${pool_name}&balance=${balance}&maxMembers=${shareholder_agreement.max_members}&members=${pool_members.length}`,
        },
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        metaTagInfo: {
          title: 'Casama',
          imageUrl: `/api/pools/metadata/ogImage?address=${address}&name=Casama`,
        },
      },
    };
  }
}
