import { currency } from '../../../../services/formatter';

export default function EventCardSubmitButton({
  loading,
  placeBet,
  selectedCompetition,
  guessOne,
  guessTwo,
  event,
}) {
  const amount = currency(selectedCompetition.stake);
  const team =
    guessOne > guessTwo
      ? event.teamHome?.name
      : guessOne < guessTwo
      ? event.teamAway?.name
      : ' a Tie';

  return (
    <div className="flex items-center justify-center w-full">
      <button
        togglable="false"
        disabled={loading}
        className="bg-casama-shiny rounded-xl hover:opacity-80 w-full py-1 text-lg my-2"
        onClick={placeBet}
      >
        Bet {amount} on {team}
      </button>
    </div>
  );
}
