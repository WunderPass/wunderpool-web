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
import { calculateOdds } from '/services/bettingHelpers';
import { compAddr, showWunderIdsAsIcons } from '/services/memberHelpers';

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
  const { event, bettingService, user } = props;
  const [eventCompetitions, setEventCompetitions] = useState([]);
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const [collapsePublic, setCollapsePublic] = useState(false);

  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const router = useRouter();

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const sortMembersOnVotes = (participants) => {
    let votes = null;
    if (!participants) return votes;
    if (participants.length > 0) {
      votes = [[], [], []];
      participants.forEach((p) => {
        if (Number(p.prediction[0]) > Number(p.prediction[1])) {
          votes[0].push(p.wunderId);
        } else if (Number(p.prediction[0]) == Number(p.prediction[1])) {
          votes[1].push(p.wunderId);
        } else if (Number(p.prediction[0]) < Number(p.prediction[1])) {
          votes[2].push(p.wunderId);
        }
      });
    }
    return votes;
  };

  const placeBet = () => {
    if (selectedCompetition.public) {
      joinPublicCompetition();
    } else {
      createPrivateCompetition();
    }
  };

  const joinPublicCompetition = () => {
    setLoading(true);
    setLoadingText('Joining Public Competition...');
    if (selectedCompetition.matchingCompetition) {
      joinSingleCompetition({
        competitionId: selectedCompetition.matchingCompetition.id,
        gameId: selectedCompetition.matchingCompetition.games[0].id,
        poolVersion: 'ETA',
        poolAddress: selectedCompetition.matchingCompetition.poolAddress,
        prediction: [guessOne, guessTwo],
        userAddress: user.address,
        stake: selectedCompetition.matchingCompetition.stake,
        event: event,
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
    } else {
      createSingleCompetition({
        event,
        stake: selectedCompetition.stake,
        creator: user.address,
        isPublic: true,
        prediction: [guessOne, guessTwo],
        afterPoolCreate: async () => {
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
    }
  };

  const createPrivateCompetition = () => {
    setLoading(true);
    setLoadingText('Creating Private Competition...');
    createSingleCompetition({
      event,
      stake: selectedCompetition.stake || customAmount,
      creator: user.address,
      isPublic: false,
      prediction: [guessOne, guessTwo],
      afterPoolCreate: async () => {
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
        setCollapsePublic(false);
      });
  };

  const toggleSelectedCompetition = (params, fromCustom = false) => {
    if (!params.public) {
      setCollapsePublic(true);
    }
    !fromCustom && setShowCustomInput(false);
    setSelectedCompetition((comp) =>
      comp.stake == params.stake && comp.public == params.public ? {} : params
    );
  };

  useEffect(() => {
    setEventCompetitions(
      bettingService.publicCompetitions.filter(
        (comp) =>
          comp.games.length == 1 &&
          comp.games.find((g) => g.event.id == event.id)
      )
    );
  }, [bettingService.isReady]);

  return (
    <>
      <div className="container-white pb-16 ">
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-5">
          <div className="opacity-50 text-base h-auto sm:h-14">
            {event.shortName}
          </div>
          <div className="flex h-auto sm:h-16 flex-row items-center mt-5 justify-between w-full text-lg ">
            <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2">
              <img
                src={`/api/betting/events/teamImage?id=${event.teamHome?.id}`}
                className="w-16"
              />
              <div className="font-semibold">{event.teamHome?.name}</div>
            </div>
            <div className="flex flex-col w-2/12 opacity-70 items-center justify-center">
              <div className="text-sm sm:text-lg">
                {toDate(event.startTime)}
              </div>
              <div className="text-sm sm:text-base">
                {toTime(event.startTime)}
              </div>
            </div>
            <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2">
              <img
                src={`/api/betting/events/teamImage?id=${event.teamAway?.id}`}
                className="w-16"
              />
              <div className="font-semibold">{event.teamAway?.name}</div>
            </div>
          </div>
        </div>
        <Collapse in={Boolean(selectedCompetition.stake)}>
          <div className="flex flex-row items-center justify-between w-full gap-3 mx-auto mb-3">
            <div className="w-5/12 flex justify-center">
              <div className="w-20">
                <input
                  disabled={loading}
                  inputMode="numeric"
                  className="textfield text-center py-1 px-3"
                  value={guessOne}
                  onChange={(e) => setGuessOne(e.target.value)}
                />
              </div>
            </div>
            <p className="text-center mt-3 text-casama-blue w-2/12">
              Your Prediction
            </p>
            <div className="w-5/12 flex justify-center">
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
                  ? event.teamHome?.name
                  : guessOne < guessTwo
                  ? event.teamAway?.name
                  : ' a Tie'}
              </button>
            </div>
          </Collapse>
        </Collapse>
        <TransactionFrame open={loading} text={loadingText} />
        {!loading && (
          <>
            <Collapse in={!collapsePublic}>
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
                      const matchingCompetition = eventCompetitions.find(
                        (comp) => comp.stake == stake
                      );
                      const participants =
                        matchingCompetition?.games?.[0]?.participants;
                      const votes = sortMembersOnVotes(participants);

                      return (
                        <div
                          key={`public-competition-${event.id}-${stake}`}
                          className={`flex flex-col container-casama-light-p-0 overflow-hidden items-between w-full ${
                            (selectedCompetition.stake == undefined &&
                              user.usdBalance >= stake) ||
                            selected
                              ? 'opacity-100'
                              : 'opacity-40'
                          }`}
                        >
                          <div className="flex flex-col items-center p-2 gap-2">
                            <div className="flex flex-row justify-between items-center w-full px-3  mt-2 sm:px-2">
                              <div className="flex flex-row">
                                <p>Pot:</p>
                                <p className="font-semibold ml-2 ">
                                  {matchingCompetition
                                    ? participants?.length < 1
                                      ? '$0'
                                      : currency(
                                          matchingCompetition?.stake *
                                            matchingCompetition?.games?.[0]
                                              ?.participants?.length
                                        )
                                    : '$0'}{' '}
                                </p>
                              </div>
                              <div className="flex flex-row">
                                <p className="font-semibold ml-1.5">
                                  {matchingCompetition
                                    ? 10 - participants?.length + ' / ' + '10'
                                    : '10 / 10'}
                                </p>
                              </div>
                            </div>

                            {participants?.find((part) =>
                              compAddr(part.address, user.address)
                            ) ? (
                              <button
                                disabled
                                className="btn-casama px-4 sm:px-6 p-1 w-full"
                              >
                                $ {stake} (Joined)
                              </button>
                            ) : (
                              <button
                                disabled={user.usdBalance < stake}
                                onClick={() =>
                                  toggleSelectedCompetition({
                                    stake,
                                    public: true,
                                    matchingCompetition,
                                  })
                                }
                                className="btn-casama px-4 sm:px-6 p-1 w-full"
                              >
                                $ {stake}
                              </button>
                            )}
                          </div>
                          {votes != null && (
                            <>
                              <Divider />
                              <div className="w-full flex justify-around p-1 ">
                                <div className="w-full text-center">
                                  <p>Home</p>
                                  <div className="flex flex-row justify-center items-center ml-2 my-1">
                                    {showWunderIdsAsIcons(votes[0], 2)}
                                  </div>
                                </div>
                                <div className="w-full text-center">
                                  <p>Tie</p>
                                  <div className="flex flex-row justify-center items-center ml-2 my-1">
                                    {showWunderIdsAsIcons(votes[1], 2)}
                                  </div>
                                </div>

                                <div className="w-full text-center">
                                  <p>Away</p>
                                  <div className="flex flex-row justify-center items-center ml-2 my-1">
                                    {showWunderIdsAsIcons(votes[2], 2)}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Collapse>

            <Divider />
            <div className="flex flex-col justify-center items-center mt-5">
              <div className=" flex-col text-semibold sm:text-lg text-center mb-4">
                <p>Create a private Betting Game </p>
              </div>

              <div className="flex flex-row w-full gap-3">
                <button
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
