import { format } from 'crypto-js';
import { useEffect, useState } from 'react';
import MultiCardPredicitionInput from './predictionInput';
require('core-js/actual/array/group-by');

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

export default function MultitCardBody(props) {
  const { competition, guessOne, guessTwo, setGuessOne, setGuessTwo } = props;
  const [gamesSortedByDate, setGamesSortedByDate] = useState([]);

  const formatCompetition = (comp) => {
    const sorted = comp.games
      .sort((a, b) =>
        a.event.startTime < b.event.startTime
          ? -1
          : a.event.startTime > b.event.startTime
          ? 1
          : 0
      )
      .groupBy((game) => {
        return game.event.startTime;
      });

    setGamesSortedByDate(sorted);
  };

  useEffect(() => {
    formatCompetition(competition);
  }, [competition]);

  return (
    <div className="flex flex-col items-center justify-center text-center my-5">
      {competition.games //TODO Add group by according to date
        .sort((a, b) =>
          a.event.startTime < b.event.startTime
            ? -1
            : a.event.startTime > b.event.startTime
            ? 1
            : 0
        )
        .map((game, i) => {
          return (
            <div className="container-gray flex h-auto  flex-row items-center mt-5 justify-between w-full text-lg py-14">
              <div className=" flex flex-col justify-center items-center w-full">
                <div>
                  <div className="text-md sm:text-xl">
                    {toDate(game.event?.startTime)}
                  </div>
                  <div className="text-md sm:text-lg">
                    {toTime(game.event?.startTime)}
                  </div>
                </div>
                <div className="flex flex-row w-full items-center justify-center text-center gap-2 sm:mt-0 mt-2 ">
                  <div className="flex flex-col w-5/12 items-center justify-center text-center sm:gap-2 gap-24 sm:mt-0 -mt-5">
                    <img
                      src={`/api/betting/events/teamImage?id=${game.event?.teamHome?.id}`}
                      className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
                    />
                    <div className="font-semibold sm:h-0 h-14 sm:ml-0 ml-6">
                      {game.event?.teamHome?.name}
                    </div>
                  </div>
                  <div className="flex flex-col w-2/12 opacity-70 items-center justify-center">
                    <div className="flex flex-col gap-3 mt-4">
                      <MultiCardPredicitionInput
                        game={game}
                        competition={competition}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                        i={i}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-5/12 items-center justify-center text-center sm:gap-2 gap-24 sm:mt-0 -mt-5">
                    <img
                      src={`/api/betting/events/teamImage?id=${game.event?.teamAway?.id}`}
                      className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
                    />
                    <div className="font-semibold sm:h-0 h-14 sm:mr-0 mr-6">
                      {game.event?.teamAway?.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
