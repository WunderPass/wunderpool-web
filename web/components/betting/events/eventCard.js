import { Collapse, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CustomInput from '/components/general/utils/customInputButton';
import TransactionFrame from '/components/general/utils/transactionFrame';
import {
  createSingleCompetition,
  joinSingleCompetition,
} from '../../../services/contract/betting/competitions';
import { currency } from '../../../services/formatter';

export default function EventCard(props) {
  const { event, games, user } = props;
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventGames, setEventGames] = useState([]);
  const [loading, setLoading] = useState(null);
  const [guessOne, setGuessOne] = useState(null);
  const [guessTwo, setGuessTwo] = useState(null);
  const router = useRouter();

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const parseStartDateTime = (dateTime) => {
    const date = new Date(dateTime);
    setStartDate(
      date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      })
    );
    setStartTime(
      date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const parseEndDateTime = (dateTime) => {
    const date = new Date(dateTime);
    setEndDate(
      date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      })
    );
    setEndTime(
      date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const joinPublicCompetition = (stake, matchingGame) => {
    setLoading(true);
    if (matchingGame) {
      joinSingleCompetition({
        gameId: matchingGame.id,
        prediction: [guessOne, guessTwo],
        creator: user.address,
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
        stake: stake,
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

  const createPrivateCompetition = (stake) => {
    setLoading(true);
    createSingleCompetition({
      event,
      stake: stake || customAmount,
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

  useEffect(() => {
    parseStartDateTime(event.startTime);
    parseEndDateTime(event.endTime);
  }, [event.endTime && event.startTime]);

  useEffect(() => {
    setEventGames(games.filter((g) => g.event.id == event.id));
  }, [games.length]);

  return (
    <>
      <div className="container-white pb-16 ">
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-5">
          <div className="opacity-50 text-base h-auto sm:h-14">
            {event.name}
          </div>
          <div className="flex h-auto sm:h-16 flex-row items-center mt-5 justify-between w-full sm:text-2xl text-lg ">
            <div className="flex flex-row w-5/12 lg:flex-col items-center justify-start sm:justify-center  text-left sm:text-center ">
              <div className="font-semibold">{event.teamHome}</div>
              <div></div>
            </div>
            <div className="flex flex-col w-2/12 opacity-70 items-center justify-center ">
              <div className="text-sm sm:text-lg">{startDate}</div>
              <div className="text-sm sm:text-base">{startTime}</div>
            </div>
            <div className="flex flex-row w-5/12 lg:flex-col items-center justify-end sm:justify-center text-right sm:text-center ">
              <div className="font-semibold">{event.teamAway}</div>
              <div></div>
            </div>
          </div>
        </div>
        <Divider />
        <p className="text-center mt-3">Your Prediction</p>
        <div className="flex flex-row items-center justify-center w-full gap-3 my-3">
          <p>{event.teamHome}</p>
          <div className="w-12">
            <input
              inputMode="numeric"
              className="textfield text-center py-1 px-3"
              value={guessOne}
              onChange={(e) => setGuessOne(e.target.value)}
            />
          </div>
          <p>:</p>
          <div className="w-12">
            <input
              inputMode="numeric"
              className="textfield text-center py-1 px-3"
              value={guessTwo}
              onChange={(e) => setGuessTwo(e.target.value)}
            />
          </div>
          <p>{event.teamAway}</p>
        </div>
        <TransactionFrame open={loading} />
        {!loading && (
          <Collapse in={Boolean(guessOne && guessTwo)} sx={{ width: '100%' }}>
            <Divider />
            <div className="my-5">
              <div className="flex justify-center items-center text-semibold sm:text-lg">
                Public Betting Games
              </div>
              <div>
                <div className="opacity-70 mb-2 mt-4 sm:mt-0 text-sm sm:text-base">
                  Enter a bet:
                </div>
                <div className="flex flex-row w-full gap-3">
                  {[5, 10, 50].map((stake) => {
                    const matchingGame = eventGames.find(
                      (g) => g.pool.shareholder_agreement.min_invest == stake
                    );
                    return (
                      <div
                        key={`public-competition-${event.id}-${stake}`}
                        className="flex flex-col container-casama-light-p-0 items-between p-3 w-full"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:p-2 p-0">
                          <div className="text-casama-blue font-semibold">
                            {currency(stake)}
                          </div>
                          <div className="opacity-50 mt-1 sm:mt-0 text-sm">
                            {matchingGame
                              ? matchingGame.pool.shareholder_agreement
                                  .max_members -
                                matchingGame.pool.pool_members.length
                              : 50}
                            /
                            {matchingGame
                              ? matchingGame.pool.shareholder_agreement
                                  .max_members
                              : 50}
                          </div>
                        </div>
                        {matchingGame?.pool?.pool_members?.find(
                          (mem) =>
                            mem.members_address.toLowerCase() ==
                            user.address.toLowerCase()
                        ) ? (
                          <button
                            disabled
                            className="btn-casama mt-2 sm:mt-0 px-4 sm:px-6 p-1"
                          >
                            Joined
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              joinPublicCompetition(stake, matchingGame)
                            }
                            className="btn-casama mt-2 sm:mt-0 px-4 sm:px-6 p-1"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col justify-center items-center mt-5">
              <div className="text-semibold sm:text-lg mb-4">
                Create a private Betting Game
              </div>

              <div className="flex flex-row w-full gap-3">
                {!showCustomInput && (
                  <>
                    <button
                      className="btn-casama w-full p-2"
                      onClick={() => createPrivateCompetition(5)}
                    >
                      $ 5
                    </button>
                    <button
                      className="btn-casama w-full p-2"
                      onClick={() => createPrivateCompetition(10)}
                    >
                      $ 10
                    </button>
                    <button
                      className="btn-casama w-full p-2"
                      onClick={() => setShowCustomInput(true)}
                    >
                      $ Custom
                    </button>
                  </>
                )}
                {showCustomInput && (
                  <>
                    <div className="w-1/3"></div>
                    <CustomInput
                      show={showCustomInput}
                      value={customAmount}
                      placeholder="$ 50"
                      onClickAway={() =>
                        setShowCustomInput(Boolean(customAmount))
                      }
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                      }}
                    />
                    <button
                      className="btn-casama w-full p-2"
                      onClick={() => createPrivateCompetition()}
                    >
                      Create
                    </button>
                    <div className="w-1/3"></div>
                  </>
                )}
              </div>
            </div>
          </Collapse>
        )}
      </div>
    </>
  );
}
