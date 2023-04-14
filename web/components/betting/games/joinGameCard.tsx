import {
  Typography,
  IconButton,
  Divider,
  Collapse,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '../../../services/formatter';
import PayoutRuleInfoButton from '../../general/utils/payoutRuleInfoButton';
import Timer from '../../general/utils/timer';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '../../../services/shareLink';
import { showWunderIdsAsIcons } from '../../../services/memberHelpers';
import AuthenticateWithCasama from '../../general/auth/authenticateWithCasama';
import LoginWithWalletConnect from '../../general/auth/loginWithWalletConnect';
import LoginWithMetaMask from '../../general/auth/loginWithMetaMask';
import { joinSingleCompetition } from '../../../services/contract/betting/competitions';
import { useRouter } from 'next/router';
import TransactionFrame from '../../general/utils/transactionFrame';
import { registerParticipant } from '../../../services/contract/betting/games';
import { joinFreeRollCompetition } from '../../../services/contract/betting/competitions';
import { transakRampOnLink } from '../../../services/transak';
import {
  FormattedCompetition,
  FormattedGame,
} from '../../../services/bettingHelpers';
import { UseNotification } from '../../../hooks/useNotification';
import { LoginMethod, UseUserType } from '../../../hooks/useUser';

type LoginParams = {
  loginMethod: LoginMethod;
  wunderId: string;
  address: string;
};

type JoinGameCardProps = {
  competition: FormattedCompetition;
  game: FormattedGame;
  handleSuccess: UseNotification.handleSuccess;
  user: UseUserType;
  handleError: UseNotification.handleError;
  secret?: string;
};

export default function JoinGameCard(props: JoinGameCardProps) {
  const { competition, game, handleSuccess, user, handleError } = props;
  const { stake, sponsored, maxMembers, payoutRule } = competition || {};

  const handleLogin = (data: LoginParams) => {
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
                    'https://app.casama.io/betting/join/' +
                      competition?.competitionId,
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
                (user?.usdBalance < (sponsored ? 0 : stake) ? (
                  <div className="flex flex-col justify-center items-center w-full mb-4">
                    <TopUpRequired {...props} />
                  </div>
                ) : game.state == 'HISTORIC' ||
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
                    {payoutRule == 'WINNER_TAKES_IT_ALL'
                      ? 'Winner Takes It All'
                      : 'Proportional'}
                  </p>

                  <div className="mt-2">
                    <PayoutRuleInfoButton />
                  </div>
                </div>
                <Divider className="my-1" />

                <div className="flex flex-row text-xl text-casama-light-blue justify-center truncate my-1 ...">
                  {showWunderIdsAsIcons(game?.participants, 7)}
                </div>
              </div>
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right ">
                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                  <p>Entry:</p>
                  <p className="ml-2">{`${
                    sponsored ? 'Free' : currency(stake)
                  }`}</p>
                </div>
                <Divider className="my-1" />
                <div className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate ...">
                  <p>Pot:</p>
                  <p className="ml-2">
                    {currency(
                      (sponsored ? stake / maxMembers : stake) *
                        game.participants.length
                    )}
                  </p>
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

type NotLoggedInProps = {
  handleLogin: (data: LoginParams) => void;
  handleError: UseNotification.handleError;
};

function NotLoggedIn({ handleLogin, handleError }: NotLoggedInProps) {
  return (
    <div className="flex flex-col justify-center items-center max-w-xs w-full">
      <Typography className="text-sm text-center">
        Sign Up or Login to join this Bet
      </Typography>
      <Divider className=" mb-4 opacity-70" />
      <AuthenticateWithCasama onSuccess={handleLogin} />
      <p className="text-gray-400 text-sm my-2 mb-1 lg:mb-1 mt-4">
        Already have a wallet?
      </p>
      <div className="max-w-xs w-full mb-4 ">
        <LoginWithMetaMask onSuccess={handleLogin} handleError={handleError} />
        <LoginWithWalletConnect onSuccess={handleLogin} />
      </div>
    </div>
  );
}

type TopUpRequiredProps = {
  user: UseUserType;
};

function TopUpRequired(props: TopUpRequiredProps) {
  const { user } = props;
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    setRedirectUrl(new URL(document.URL));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <div>X</div>
      <Typography className="text-sm mt-3">
        To continue, your Account needs more funds.
      </Typography>
      <Typography className="text-xl my-3">
        Deposit funds to your wallet
      </Typography>
      {redirectUrl && (
        <a
          className="w-full"
          href={transakRampOnLink({
            address: user.address,
            amount: 50,
            redirectUrl,
          })}
          target="_blank"
        >
          <button className="btn-casama p-3  w-full">Deposit now</button>
        </a>
      )}
    </div>
  );
}

type InputJoinAmountProps = {
  game: FormattedGame;
  competition: FormattedCompetition;
  secret?: string;
  user: UseUserType;
  handleError: UseNotification.handleError;
};

function InputJoinAmount(props: InputJoinAmountProps) {
  const { game, competition, secret, user, handleError } = props;
  const { stake, poolAddress, sponsored } = competition || {};

  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const [mustClickAgain, setMustClickAgain] = useState(null);
  const router = useRouter();

  const placeBet = async () => {
    setLoading(true);
    setLoadingText('Joining Competition...');
    try {
      if (sponsored) {
        await joinFreeRollCompetition({
          competitionId: competition.competitionId,
          userAddress: user.address,
        });
      } else {
        await joinSingleCompetition({
          userAddress: user.address,
          stake: stake,
          poolAddress: poolAddress,
          poolVersion: 'ETA',
          secret,
          chain: game.event.chain,
        });
      }
      if (user.loginMethod == 'Casama') {
        await registerBet();
      } else {
        setMustClickAgain(true);
      }
    } catch (error) {
      handleError(error, user.wunderId, user.userName);
    }
    setLoading(false);
  };

  const registerBet = async () => {
    setLoading(true);
    setLoadingText('Placing your Bet...');
    try {
      await registerParticipant(
        competition?.competitionId,
        competition.blockchainId,
        game.id,
        [Number(guessOne), Number(guessTwo)],
        user.address,
        game.event.version,
        game.event.chain
      );
      user.fetchUsdBalance();
      router.push('/betting/bets');
    } catch (error) {
      handleError(error, user.wunderId, user.userName);
    }
    setLoadingText(null);
    setLoading(false);
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
            Bet {sponsored ? '' : currency(stake)} on{' '}
            {guessOne > guessTwo
              ? game.event.teamHome?.name
              : guessOne < guessTwo
              ? game.event.teamAway?.name
              : ' a Tie'}
          </button>
        </div>
      </Collapse>
      <Collapse in={mustClickAgain && !loading}>
        <div className="my-5">
          <div className="flex flex-col justify-center items-center text-semibold sm:text-lg gap-3">
            Click here to Confirm your Bet on Chain
            <button
              className="btn-casama py-2 px-3 text-lg"
              onClick={registerBet}
            >
              Confirm my Bet
            </button>
          </div>
        </div>
      </Collapse>
      <TransactionFrame open={loading} text={loadingText} />
    </div>
  );
}
