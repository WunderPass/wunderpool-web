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

export default function MultitCardHeader({ competition, specialEvent }) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-2 ">
      <div className="flex flex-col text-gray-500 text-base h-auto sm:h-14">
        <span>{competition.name}</span>{' '}
        <span>({competition.games.length} games in competition)</span>
      </div>

      {competition.games.map((game) => {
        return (
          <div className="flex h-auto sm:h-16 flex-row items-center mt-5 justify-between w-full text-lg py-14">
            <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2 ">
              <img
                src={`/api/betting/events/teamImage?id=${game.event?.teamHome?.id}`}
                className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
              />
              <div className="font-semibold">{game.event?.teamHome?.name}</div>
            </div>
            <div className="flex flex-col w-2/12 opacity-70 items-center justify-center">
              <div className="text-sm sm:text-lg">
                {toDate(game.event?.startTime)}
              </div>
              <div className="text-sm sm:text-base">
                {toTime(game.event?.startTime)}
              </div>
            </div>
            <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2">
              <img
                src={`/api/betting/events/teamImage?id=${game.event?.teamAway?.id}`}
                className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
              />
              <div className="font-semibold">{game.event?.teamAway?.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
