import { Alert, Container, Divider, Typography, Collapse } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';
import useGame from '/hooks/useGame';
import LoginWithMetaMask from '/components/general/auth/loginWithMetaMask';
import LoginWithWalletConnect from '/components/general/auth/loginWithWalletConnect';
import AuthenticateWithCasama from '/components/general/auth/authenticateWithCasama';
import DashboardGameCard from '/components/betting/games/dashboardGameCard';
import { joinSingleCompetition } from '/services/contract/betting/competitions';
import CustomHeader from '/components/general/utils/customHeader';

export default function JoinPool(props) {
  const router = useRouter();
  const { user, metaTagInfo, handleInfo, handleError } = props;
  const game = useGame(router.query.id, user);

  const handleLogin = (data) => {
    user.updateLoginMethod(data.loginMethod);
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

  const loginCallback = () => {
    router.push(`/betting/bets?sortId=${game.game.id}`); //TODO add sortId in for bets (check /pools?sortId=27)
  };

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
        {!user?.loggedIn && (
          <div className="flex flex-col justify-center items-center w-full container-gray mt-7">
            {!user?.loggedIn && (
              <NotLoggedIn
                handleLogin={handleLogin}
                handleError={handleError}
              />
            )}
          </div>
        )}

        {game.isReady && (
          <div className="flex flex-col my-8 w-full ">
            <DashboardGameCard
              key={`dashboard-game-card-${game.game.id}`}
              game={game.game}
              user={user}
              {...props}
            />

            {user?.loggedIn &&
              (user?.usdBalance < 3 ? (
                <div className="flex flex-col justify-center items-center container-gray w-full -mt-5">
                  <TopUpRequired {...props} />
                </div>
              ) : game.game.closed ? (
                <div className="flex flex-col justify-center items-center container-gray w-full -mt-5">
                  <Alert
                    severity="warning"
                    className="w-full items-center my-1"
                  >
                    This Bet is already closed
                  </Alert>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center container-gray w-full -mt-5">
                  <InputJoinAmount game={game.game} user={user} />
                </div>
              ))}
          </div>
        )}
      </Container>
    </>
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
    <div className="flex flex-col justify-center items-center">
      <Typography className="text-sm mt-3">
        To continue, your Account needs more funds.
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
          <button className="btn-casama p-3  w-full">Deposit now</button>
        </a>
      )}
    </div>
  );
}

function InputJoinAmount(props) {
  const { game, user } = props;
  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [loading, setLoading] = useState(null);

  const placeBet = () => {
    joinPublicCompetition();
  };

  const joinPublicCompetition = () => {
    setLoading(true);
    joinSingleCompetition({
      gameId: game.id,
      poolAddress: game.poolAddress,
      prediction: [guessOne, guessTwo],
      userAddress: user.address,
      stake: game.stake,
      poolVersion: 'ETA', //TODO
      wunderId: user.wunderId,
      event: game.event,
    })
      .then(() => {
        setLoading(false);
        router.push('/betting/bets');
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between w-9/12 gap-3 mx-auto mb-3">
        <div className="w-20">
          <input
            disabled={loading}
            inputMode="numeric"
            className="textfield text-center py-1 px-3"
            value={guessOne}
            onChange={(e) => setGuessOne(e.target.value)}
          />
        </div>
        <p className="text-center mt-3 text-casama-blue">Your Prediction</p>
        <div className="w-20">
          <input
            disabled={loading}
            inputMode="numeric"
            className="textfield text-center py-1 px-3"
            value={guessTwo}
            onChange={(e) => setGuessTwo(e.target.value)}
          />
        </div>
      </div>
      <Collapse in={Boolean(guessOne && guessTwo)}>
        <div className="flex items-center justify-center">
          <button
            disabled={loading}
            className="btn-casama px-5 py-2 text-xl"
            onClick={placeBet}
          >
            Bet {currency(game.stake / 1000000) /*TODO*/} on{' '}
            {guessOne > guessTwo
              ? game.event.teamHome?.name
              : guessOne < guessTwo
              ? game.event.teamAway?.name
              : ' a Tie'}
          </button>
        </div>
      </Collapse>
    </div>
  );
}

//TODO change this to ID not address and display game info
export async function getServerSideProps(context) {
  const id = context.query.id;

  try {
    const data = await (
      await fetch(`https://app.casama.io/api/betting/games?gameId=${id}`)
    ).json();
    const event = data[0]?.event;
    if (
      event.teamHome?.name &&
      event.teamAway?.name &&
      event.teamHome?.id &&
      event.teamAway?.id
    ) {
      return {
        props: {
          metaTagInfo: {
            title: `Casama - Bet on ${event.teamHome.name} vs. ${event.teamAway.name}`,
            description: event.name,
            imageUrl: `/api/betting/metadata/ogImage?teamHomeId=${event.teamHome.id}&teamAwayId=${event.teamAway.id}&eventName=${event.name}`,
          },
        },
      };
    } else {
      return {
        props: {
          metaTagInfo: {
            title: 'Casama - Betting with Friends',
            imageUrl: `/api/betting/metadata/ogImage`,
          },
        },
      };
    }
  } catch (error) {
    console.log(error);
    return {
      props: {
        metaTagInfo: {
          title: 'Casama - Betting with Friends',
          imageUrl: `/api/betting/metadata/ogImage`,
        },
      },
    };
  }
}
