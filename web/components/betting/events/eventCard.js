import { Collapse, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CustomInput from '/components/general/utils/customInputButton';
import TransactionFrame from '/components/general/utils/transactionFrame';
import {
  createSingleCompetition,
  joinSingleCompetition,
} from '/services/contract/betting/competitions';
import { currency } from '/services/formatter';

function toDate(str) {
  return str
    ? new Date(str).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      })
    : '---';
}

function toTime(str) {
  return str
    ? new Date(str).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';
}

export default function EventCard(props) {
  const { event, games, user } = props;
  const [eventGames, setEventGames] = useState([]);
  const [loading, setLoading] = useState(null);

  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const router = useRouter();

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const placeBet = () => {
    if (selectedCompetition.public) {
      joinPublicCompetition();
    } else {
      createPrivateCompetition();
    }
  };

  const joinPublicCompetition = () => {
    setLoading(true);
    if (selectedCompetition.matchingGame) {
      joinSingleCompetition({
        gameId: selectedCompetition.matchingGame.id,
        poolAddress: selectedCompetition.matchingGame.poolAddress,
        prediction: [guessOne, guessTwo],
        userAddress: user.address,
        stake: selectedCompetition.matchingGame.stake,
        poolVersion:
          selectedCompetition.matchingGame.pool.launcher.launcher_version,
        wunderId: user.wunderId,
        event: event,
      })
        .then(() => {
          setLoading(false);
          router.push('/betting/bets');
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      createSingleCompetition({
        event,
        stake: selectedCompetition.stake,
        creator: user.address,
        wunderId: user.wunderId,
        isPublic: true,
        prediction: [guessOne, guessTwo],
      })
        .then(() => {
          setLoading(false);
          router.push('/betting/bets');
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const createPrivateCompetition = () => {
    setLoading(true);
    createSingleCompetition({
      event,
      stake: selectedCompetition.stake || customAmount,
      creator: user.address,
      wunderId: user.wunderId,
      isPublic: false,
      prediction: [guessOne, guessTwo],
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

  const toggleSelectedCompetition = (params, fromCustom = false) => {
    !fromCustom && setShowCustomInput(false);
    setSelectedCompetition((comp) =>
      comp.stake == params.stake && comp.public == params.public ? {} : params
    );
  };

  useEffect(() => {
    setEventGames(games.filter((g) => g.event.id == event.id));
  }, [games.length]);

  return (
    <>
      <div className="container-white pb-16 ">
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-5">
          <div className="opacity-50 text-base h-auto sm:h-14">
            {event.shortName}
          </div>
          <div className="flex h-auto sm:h-16 flex-row items-center mt-5 justify-between w-full sm:text-2xl text-lg ">
            <div className="flex flex-row w-5/12 lg:flex-col items-center justify-start sm:justify-center  text-left sm:text-center ">
              <div className="font-semibold">{event.teamHome}</div>
            </div>
            <div className="flex flex-col w-2/12 opacity-70 items-center justify-center ">
              <div className="text-sm sm:text-lg">
                {toDate(event.startTime)}
              </div>
              <div className="text-sm sm:text-base">
                {toTime(event.startTime)}
              </div>
            </div>
            <div className="flex flex-row w-5/12 lg:flex-col items-center justify-end sm:justify-center text-right sm:text-center ">
              <div className="font-semibold">{event.teamAway}</div>
            </div>
          </div>
        </div>
        <Collapse in={Boolean(selectedCompetition.stake)}>
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
                Bet {currency(selectedCompetition.stake)} on{' '}
                {guessOne > guessTwo
                  ? event.teamHome
                  : guessOne < guessTwo
                  ? event.teamAway
                  : ' a Tie'}
              </button>
            </div>
          </Collapse>
        </Collapse>
        <TransactionFrame open={loading} />
        {!loading && (
          <>
            <Divider />
            <div className="my-5">
              <div className="flex justify-center items-center text-semibold sm:text-lg mb-4">
                Public Betting Games
              </div>
              <div>
                <div className="flex flex-row w-full gap-3 flex-wrap sm:flex-nowrap">
                  {[5, 10, 50].map((stake) => {
                    const selected =
                      selectedCompetition.public &&
                      selectedCompetition.stake == stake &&
                      !showCustomInput;
                    const matchingGame = eventGames.find(
                      (g) => g.pool.shareholder_agreement.min_invest == stake
                    );
                    return (
                      <div
                        key={`public-competition-${event.id}-${stake}`}
                        className={`flex flex-col container-casama-light-p-0 items-between p-3 w-full ${
                          (selectedCompetition.stake == undefined &&
                            user.usdBalance >= stake) ||
                          selected
                            ? 'opacity-100'
                            : 'opacity-40'
                        }`}
                      >
                        <div className="flex flex-col items-center p-1 gap-2">
                          {matchingGame
                            ? matchingGame.pool.shareholder_agreement
                                .max_members -
                              matchingGame.pool.pool_members.length
                            : 50}{' '}
                          Spots Left
                          {matchingGame?.pool?.pool_members?.find(
                            (mem) =>
                              mem.members_address.toLowerCase() ==
                              user.address.toLowerCase()
                          ) ? (
                            <button
                              disabled
                              className="btn-casama px-4 sm:px-6 p-1 w-full"
                            >
                              {currency(stake)} (Joined)
                            </button>
                          ) : (
                            <button
                              disabled={user.usdBalance < stake}
                              onClick={() =>
                                toggleSelectedCompetition({
                                  stake,
                                  public: true,
                                  matchingGame,
                                })
                              }
                              className="btn-casama px-4 sm:px-6 p-1 w-full"
                            >
                              {currency(stake)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col justify-center items-center mt-5">
              <div className=" flex-col text-semibold sm:text-lg text-center mb-4">
                <p>Create a private Betting Game </p>
                <p>(Currently not available)</p>
              </div>

              <div className="flex flex-row w-full gap-3">
                <button
                  disabled
                  className={`btn-casama w-full p-2 ${
                    (selectedCompetition.stake == undefined &&
                      user.usdBalance >= 5) ||
                    (!selectedCompetition.public &&
                      selectedCompetition.stake == 5 &&
                      !showCustomInput)
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                  onClick={() =>
                    toggleSelectedCompetition({ stake: 5, public: false })
                  }
                >
                  $ 5
                </button>
                <button
                  disabled
                  className={`btn-casama w-full p-2 ${
                    (selectedCompetition.stake == undefined &&
                      user.usdBalance >= 10) ||
                    (!selectedCompetition.public &&
                      selectedCompetition.stake == 10 &&
                      !showCustomInput)
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                  onClick={() =>
                    toggleSelectedCompetition({ stake: 10, public: false })
                  }
                >
                  $ 10
                </button>
                <CustomInput
                  className="bg-casama-blue text-white"
                  show={showCustomInput}
                  value={customAmount}
                  placeholder="$ 50"
                  onClickAway={() => setShowCustomInput(Boolean(customAmount))}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    toggleSelectedCompetition(
                      {
                        stake: e.target.value,
                        public: false,
                      },
                      true
                    );
                  }}
                />
                {!showCustomInput && (
                  <button
                    disabled
                    className={`btn-casama w-full p-2 ${
                      selectedCompetition.stake == undefined
                        ? 'opacity-100'
                        : 'opacity-40'
                    }`}
                    onClick={() => setShowCustomInput(true)}
                  >
                    $ Custom
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
