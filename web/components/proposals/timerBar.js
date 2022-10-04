export default function TimerBar(props) {
  const { passed, total } = props;

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  return (
    <>
      <div className="h-2.5 overflow-hidden text-xs flex rounded-full bg-white transition-all">
        <div
          style={{
            width: percentage(passed, total) + '%',
            transition: 'width 1s linear',
          }}
          className="rounded-full shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-casama-blue"
        ></div>
      </div>
    </>
  );
}
