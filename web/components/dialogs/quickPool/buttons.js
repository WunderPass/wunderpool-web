export default function QuickPoolButtons(props) {
  const { step, totalSteps, disabled, setStep, submit, retry } = props;
  if (retry)
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <button className="btn-casama w-full py-3 mt-2" onClick={submit}>
          Retry
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <button className="btn-casama w-full py-3 mt-2" onClick={submit}>
        Submit
      </button>
    </div>
  );
}
