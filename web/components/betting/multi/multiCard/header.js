export default function MultitCardHeader(props) {
  const { competition } = props;

  return (
    <div className="flex flex-col items-center justify-center text-center mt-2 ">
      <div className="flex flex-col text-gray-500 text-2xl h-auto sm:h-5">
        <span>{competition.name}</span>{' '}
        <span>({competition.games.length} games in competition)</span>
      </div>
    </div>
  );
}
