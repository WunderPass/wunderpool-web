import { currency } from '../../../../services/formatter';

export default function MulitCardSubmitButton({ loading, placeBet, disabled }) {
  return (
    <div className="flex items-center justify-center w-full ">
      <button
        togglable="false"
        disabled={loading || disabled}
        className={
          loading || disabled
            ? 'btn-casama rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
            : 'bg-casama-shiny rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
        }
        onClick={placeBet}
      >
        <p className="text-2xl">Place all your bets</p>
      </button>
    </div>
  );
}
