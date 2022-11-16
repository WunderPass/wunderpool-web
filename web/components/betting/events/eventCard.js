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
import { BsFillArrowUpSquareFill } from 'react-icons/bs';

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
  const [showPredicitionInput, setShowPredicitionInput] = useState();
  const [isPredicitonPublic, setIsPredicitonPublic] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const router = useRouter();

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const sortMembersOnVotes = (participants, members) => {
    let votes = null;
    if (!participants) return votes;
    if (participants.length > 0) {
      votes = [[], [], []];
      participants.forEach((p) => {
        const wunderId = members.find((m) =>
          compAddr(m.address, p.address)
        )?.wunderId;
        if (Number(p.prediction[0]) > Number(p.prediction[1])) {
          votes[0].push(wunderId);
        } else if (Number(p.prediction[0]) == Number(p.prediction[1])) {
          votes[1].push(wunderId);
        } else if (Number(p.prediction[0]) < Number(p.prediction[1])) {
          votes[2].push(wunderId);
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
          user.fetchUsdBalance();
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
          user.fetchUsdBalance();
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
        user.fetchUsdBalance();
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

  const toggleSelectedCompetition = (params, fromCustom = false) => {
    setIsPredicitonPublic(params.public);
    setShowPredicitionInput(params.stake);

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
      <div
        id={`${event.name}`}
        className={
          showDetails
            ? 'container-white pb-16'
            : 'container-white pb-16 cursor-pointer'
        }
      >
        <div onClick={() => setShowDetails(true)}>
          <div className="flex flex-col items-center justify-center text-center mt-2 ">
            <div className="opacity-50 text-base h-auto sm:h-14">
              {event.shortName}
            </div>
            <div className="flex h-auto sm:h-16 flex-row items-center mt-5 justify-between w-full text-lg ">
              <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2">
                <img
                  src={`/api/betting/events/teamImage?id=${event.teamHome?.id}`}
                  className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
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
                  className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
                />
                <div className="font-semibold">{event.teamAway?.name}</div>
              </div>
            </div>
          </div>
          {/* <Collapse in={Boolean(selectedCompetition.stake)}>
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
          </Collapse> */}
          <div className="mt-6">
            <TransactionFrame open={loading} text={loadingText} />
          </div>
          {!loading && (
            <>
              <Collapse in={showDetails}>
                <Divider className="mt-6" />
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
                        const votes = sortMembersOnVotes(
                          participants,
                          matchingCompetition?.members
                        );

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
                                  className="btn-casama px-4 sm:px-6 py-1 text-lg w-full"
                                >
                                  $ {stake} (Joined)
                                </button>
                              ) : guessOne &&
                                guessTwo &&
                                stake === showPredicitionInput &&
                                isPredicitonPublic &&
                                !showCustomInput ? (
                                <div className="flex items-center justify-center w-full">
                                  <button
                                    disabled={loading}
                                    className="btn-casama w-full  py-1 text-lg mb-3"
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
                                  className="btn-casama  p-1 text-lg w-full"
                                >
                                  $ {stake}
                                </button>
                              )}
                            </div>
                            <Divider />
                            {votes != null &&
                            (stake !== showPredicitionInput ||
                              !isPredicitonPublic) ? (
                              <>
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
                            ) : (
                              <Collapse
                                in={
                                  stake === showPredicitionInput &&
                                  isPredicitonPublic &&
                                  !showCustomInput
                                }
                              >
                                <PredicitionInput
                                  event={event}
                                  loading={loading}
                                  guessOne={guessOne}
                                  guessTwo={guessTwo}
                                  setGuessOne={setGuessOne}
                                  setGuessTwo={setGuessTwo}
                                />
                              </Collapse>
                            )}
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
                  </div>
                  <div className="flex flex-col sm:flex-row w-full gap-5 sm:gap-3 ">
                    {[5, 10, 0].map((stake) => {
                      return (
                        <>
                          <div className="flex flex-col w-full container-casama-light-p-0 ">
                            {stake > 0 ? (
                              <div>
                                <div className=" w-full p-3">
                                  {guessOne &&
                                  guessTwo &&
                                  stake === showPredicitionInput &&
                                  !isPredicitonPublic &&
                                  !showCustomInput ? (
                                    <div className="flex items-center justify-center">
                                      <button
                                        disabled={loading}
                                        className="btn-casama w-full py-1 text-lg my-2"
                                        onClick={placeBet}
                                      >
                                        Bet{' '}
                                        {currency(selectedCompetition.stake)} on{' '}
                                        {guessOne > guessTwo
                                          ? event.teamHome?.name
                                          : guessOne < guessTwo
                                          ? event.teamAway?.name
                                          : ' a Tie'}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className={`btn-casama w-full py-1 text-lg my-2 ${
                                        (selectedCompetition.stake ==
                                          undefined &&
                                          user.usdBalance >= stake) ||
                                        (!selectedCompetition.public &&
                                          selectedCompetition.stake == stake &&
                                          !showCustomInput)
                                          ? 'opacity-100'
                                          : 'opacity-40'
                                      }`}
                                      onClick={() =>
                                        toggleSelectedCompetition({
                                          stake: stake,
                                          public: false,
                                        })
                                      }
                                    >
                                      $ {stake}
                                    </button>
                                  )}
                                </div>

                                <Collapse
                                  in={
                                    stake === showPredicitionInput &&
                                    !isPredicitonPublic &&
                                    !showCustomInput
                                  }
                                >
                                  <Divider className="w-full" />

                                  <PredicitionInput
                                    event={event}
                                    loading={loading}
                                    guessOne={guessOne}
                                    guessTwo={guessTwo}
                                    setGuessOne={setGuessOne}
                                    setGuessTwo={setGuessTwo}
                                  />
                                </Collapse>
                              </div>
                            ) : (
                              <div>
                                <div className=" w-full p-3">
                                  {guessOne && guessTwo && showCustomInput ? (
                                    <div className="flex items-center justify-center">
                                      <button
                                        disabled={loading}
                                        className="btn-casama w-full  py-1 text-lg my-2"
                                        onClick={placeBet}
                                      >
                                        Bet{' '}
                                        {currency(selectedCompetition.stake)} on{' '}
                                        {guessOne > guessTwo
                                          ? event.teamHome?.name
                                          : guessOne < guessTwo
                                          ? event.teamAway?.name
                                          : ' a Tie'}
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <CustomInput
                                        className="bg-casama-blue text-white"
                                        show={showCustomInput}
                                        value={customAmount}
                                        placeholder="$ 50"
                                        onClickAway={() =>
                                          setShowCustomInput(
                                            Boolean(customAmount)
                                          )
                                        }
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
                                          className={`btn-casama w-full py-1 text-lg my-2 ${
                                            selectedCompetition.stake ==
                                            undefined
                                              ? 'opacity-100'
                                              : 'opacity-40'
                                          }`}
                                          onClick={() =>
                                            setShowCustomInput(true)
                                          }
                                        >
                                          $ Custom
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                                <Collapse in={showCustomInput}>
                                  <Divider className="w-full" />
                                  <PredicitionInput
                                    event={event}
                                    loading={loading}
                                    guessOne={guessOne}
                                    guessTwo={guessTwo}
                                    setGuessOne={setGuessOne}
                                    setGuessTwo={setGuessTwo}
                                  />
                                </Collapse>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })}
                  </div>
                </div>
              </Collapse>
            </>
          )}
        </div>
        {showDetails && !loading && (
          <div className="flex flex-row justify-center items-center mt-5">
            <a href={`#${event.name}`} scroll={true}>
              <button
                onClick={() => {
                  setShowDetails(false);
                }}
              >
                <div className="flex flex-row items-center justify-center">
                  <div className="underline text-casama-blue ">
                    Hide betting games
                  </div>
                  <BsFillArrowUpSquareFill className="text-casama-blue text-xl mx-2" />
                </div>
              </button>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

function PredicitionInput(props) {
  const { event, loading, guessOne, guessTwo, setGuessOne, setGuessTwo } =
    props;

  return (
    <>
      <div className="flex items-center justify-center text-casama-blue mt-4">
        <p>Your Prediciton</p>
      </div>

      <div className="flex flex-row justify-between w-full mb-3">
        <div className="w-full flex flex-col items-center justify-center">
          <div>{(event?.teamHome?.name).substr(0, 3)}</div>
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
        <div className="w-full flex flex-col items-center justify-center">
          <div>{(event?.teamAway?.name).substr(0, 3)}</div>
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
    </>
  );
}
