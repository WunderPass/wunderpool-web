export default function MultitCardHeader(props) {
  const { competition } = props;

  return (
    <div className="flex flex-col items-center justify-center text-center mt-2 ">
      <div className="flex flex-col text-gray-500 text-2xl h-auto sm:h-5">
        <span>{competition.name}</span>{' '}
        <span>({competition.games.length} games in competition)</span>
      </div>
      <div className="flex flex-row justify-between items-center mt-16">
        {competition.games.map((game) => {
          return (
            <div className="flex flex-col sm:flex-row ">
              <img
                src={`/api/betting/events/teamImage?id=${game.event?.teamHome?.id}`}
                className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)] "
              />
              <img
                src={`/api/betting/events/teamImage?id=${game.event?.teamAway?.id}`}
                className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
