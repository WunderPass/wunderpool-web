export default function NewPoolButtons(props) {
  const { step, totalSteps, disabled, setStep, submit, retry } = props;
  if (retry)
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <button className="btn-kaico w-full py-3 mt-2" onClick={submit}>
          Retry
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {step != 1 && (
        <button
          className="btn-neutral w-full py-3"
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </button>
      )}
      {step != totalSteps && (
        <button
          className="btn-kaico w-full py-3 mt-2"
          onClick={() => setStep((s) => s + 1)}
          disabled={disabled}
        >
          Continue
        </button>
      )}
      {step == totalSteps && (
        <button className="btn-kaico w-full py-3 mt-2" onClick={submit}>
          Submit
        </button>
      )}
    </div>
  );
}
