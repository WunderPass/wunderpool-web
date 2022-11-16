import {
  Typography,
  IconButton,
  Divider,
  Collapse,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '/services/formatter';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';
import Timer from '/components/general/utils/timer';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import { getEnsNameFromAddress } from '/services/memberHelpers';
import { showWunderIdsAsIcons } from '/services/memberHelpers';
import AuthenticateWithCasama from '/components/general/auth/authenticateWithCasama';
import LoginWithWalletConnect from '/components/general/auth/loginWithWalletConnect';
import LoginWithMetaMask from '/components/general/auth/loginWithMetaMask';
import { joinSingleCompetition } from '/services/contract/betting/competitions';
import { useRouter } from 'next/router';
import TransactionFrame from '/components/general/utils/transactionFrame';

export default function JoinGameCard(props) {
  const { competition, game, handleSuccess, user, handleError } = props;
  const stake = competition?.stake;

  const handleLogin = (data) => {
    user.updateLoginMethod(data.loginMethod);
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

  return (
    <div className="container-gray pb-16 w-full">
      <div className="flex flex-col items-start gap-2  w-full">
        <div className="flex flex-row justify-center items-start w-full mb-4">
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col justify-start items-start ">
              <MdSportsSoccer className="text-4xl sm:text-5xl text-casama-blue " />
              <IconButton
                className="container-round-transparent items-center justify-center bg-white p-2 sm:p-3 ml-0 mt-2 "
                onClick={() =>
                  handleShare(
                    'https://app.casama.io/betting/join/' + competition.id,
                    `Look at this Bet: `,
                    handleSuccess
                  )
                }
              >
                <ShareIcon className="text-casama-blue sm:text-2xl text-lg" />
              </IconButton>
            </div>
          </div>
          <Typography className="text-xl sm:text-3xl font-bold mx-3 text-gray-800 text-center my-1 sm:my-3 w-full mr-12 sm:mr-14 ">
            {game.event.shortName}
          </Typography>
        </div>

        <div className="flex flex-col w-full ">
          <div className="flex flex-col w-full justify-center items-center mb-5 ">
            <div className="w-full sm:w-2/3 md:w-7/12 ">
              <div className="flex flex-col w-full ml-2">
                {/* ICONS */}
                <div className="flex flex-row justify-between items-center text-center w-full">
                  <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                    <img
                      src={`/api/betting/events/teamImage?id=${game.event.teamHome.id}`}
                      className="w-16 mb-2"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                    <img
                      src={`/api/betting/events/teamImage?id=${game.event.teamAway.id}`}
                      className="w-16 mb-2"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg sm:text-xl font-semibold">vs</p>
                </div>

                {/* NAMEN */}
                <div className="flex flex-row justify-between items-center text-center mb-4 w-full">
                  <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                    <p className="text-xl sm:text-2xl font-semibold ">
                      {game.event.teamHome?.name || game.event?.teamHome}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                    <p className="text-xl sm:text-2xl font-semibold ">
                      {game.event.teamAway?.name || game.event?.teamAway}
                    </p>
                  </div>
                </div>
              </div>
              {user?.loggedIn &&
                (user?.usdBalance < 3 ? (
                  <div className="flex flex-col justify-center items-center w-full mb-4">
                    <TopUpRequired {...props} />
                  </div>
                ) : game.state == 'RESOLVED' ||
                  new Date(game.event.startTime) < new Date() ? (
                  <div className="flex flex-col justify-center items-center w-full mb-4">
                    <Alert
                      severity="warning"
                      className="w-full items-center my-1"
                    >
                      You can no longer bet on this bet as its already closed
                    </Alert>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center w-full mb-4 ">
                    <InputJoinAmount {...props} />
                  </div>
                ))}
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-4">
                <div className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate ...">
                  <p className="mx-2 ">
                    {competition.payoutRule == 'WINNER_TAKES_IT_ALL'
                      ? 'Winner Takes It All'
                      : 'Proportional'}
                  </p>

                  <div className="mt-2">
                    <PayoutRuleInfoButton />
                  </div>
                </div>
                <Divider className="my-1" />

                <div className="flex flex-row text-xl text-casama-light-blue justify-center truncate my-1 ...">
                  {showWunderIdsAsIcons(
                    competition.members.map((m) => m.wunderId),
                    7
                  )}
                </div>
              </div>
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right ">
                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                  <p>Entry:</p>
                  <p className="ml-2">{`${currency(stake)}`}</p>
                </div>
                <Divider className="my-1" />
                <div className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate ...">
                  <p>Pot:</p>
                  <p className="ml-2">{` ${currency(
                    stake * game.participants.length
                  )} `}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-1 items-center justify-center my-2 mb-4">
            {game.event.state == 'RESOLVED' ? (
              <div className="container-transparent-clean p-1 py-3  bg-casama-light text-white sm:w-4/5 w-full flex flex-col justify-center items-center">
                <p className="mb-4 sm:mb-5 pb-1 sm:pb-2 mt-1 text-xl sm:text-2xl font-medium border-b border-gray-400 w-11/12 text-center">
                  Result
                </p>
                <div className="flex flex-row justify-center items-center w-full mb-3">
                  <p className="w-5/12 text-center text-base sm:text-xl px-2 ">
                    {game.event.teamHome?.name}
                  </p>

                  <div className="w-2/12 flex flex-row justify-center ">
                    <p className="font-semibold text-xl sm:text-2xl">
                      {game.event?.outcome[0] || 0}
                    </p>
                    <p className="px-1 text-xl sm:text-2xl">:</p>
                    <p className="font-semibold text-xl sm:text-2xl">
                      {game.event?.outcome[1] || 0}
                    </p>
                  </div>
                  <p className="w-5/12 text-center text-base sm:text-xl px-2">
                    {game.event.teamAway?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="container-transparent-clean p-1 py-5 sm:w-2/3 w-full bg-casama-light text-white 0 flex flex-col justify-center items-center relative">
                {new Date(game.event.startTime) < new Date() && (
                  <div className="absolute top-2 right-3 flex items-center gap-1 animate-pulse">
                    <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                    <div className="text-sm">LIVE</div>
                  </div>
                )}
                <Timer
                  start={Number(new Date())}
                  end={
                    new Date(game.event.startTime) > new Date()
                      ? game.event.startTime
                      : game.event.endTime
                  }
                />
              </div>
            )}
          </div>
          {!user?.loggedIn && (
            <div className="flex flex-col justify-center items-center  mt-4 ">
              {!user?.loggedIn && (
                <NotLoggedIn
                  handleLogin={handleLogin}
                  handleError={handleError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotLoggedIn({ handleLogin, handleError }) {
  return (
    <div className="flex flex-col justify-center items-center w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
      <Typography className="text-sm text-center">
        Sign Up or Login to join this Bet
      </Typography>
      <Divider className=" mb-4 opacity-70" />
      <AuthenticateWithCasama onSuccess={handleLogin} />
      <p className="text-gray-400 text-sm my-2 mb-1 lg:mb-1 mt-4">
        Already have a wallet?
      </p>
      <div className="max-w-sm mb-4">
        <LoginWithMetaMask onSuccess={handleLogin} handleError={handleError} />
        <LoginWithWalletConnect
          onSuccess={handleLogin}
          handleError={handleError}
        />
      </div>
    </div>
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
  const { game, competition, secret, user } = props;
  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const router = useRouter();

  const placeBet = () => {
    setLoading(true);
    setLoadingText('Joining Competition...');

    joinSingleCompetition({
      competitionId: competition.id,
      gameId: game.id,
      poolAddress: competition.poolAddress,
      prediction: [guessOne, guessTwo],
      userAddress: user.address,
      stake: competition.stake,
      secret,
      poolVersion: 'ETA',
      event: game.event,
      afterPoolJoin: async () => {
        setLoadingText('Placing your Bet...');
      },
    })
      .then(() => {
        router.push('/betting/bets');
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        setLoadingText(null);
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
            Bet {currency(competition.stake)} on{' '}
            {guessOne > guessTwo
              ? game.event.teamHome?.name
              : guessOne < guessTwo
              ? game.event.teamAway?.name
              : ' a Tie'}
          </button>
        </div>
      </Collapse>
      <TransactionFrame open={loading} text={loadingText} />
    </div>
  );
}
