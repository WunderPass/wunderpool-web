import { currency } from '../../../../services/formatter';

export default function MulitCardSubmitButton({ loading, placeBet, disabled }) {
  return (
    <div className="flex items-center justify-center w-full">
      <button
        togglable="false"
        disabled={loading || disabled}
        className="bg-casama-shiny rounded-xl hover:opacity-80 w-full py-1 text-lg my-2"
        onClick={placeBet}
      >
        Confirm your bets
      </button>
    </div>
  );
}
