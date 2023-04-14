import { SelectedCompetitionParams } from '.';
import { FormattedEvent } from '../../../../services/bettingHelpers';
import { currency } from '../../../../services/formatter';

type EventCardSubmitButtonProps = {
  loading: boolean;
  placeBet: () => void;
  selectedCompetition: SelectedCompetitionParams;
  guessOne: string | number;
  guessTwo: string | number;
  event: FormattedEvent;
};

export default function EventCardSubmitButton(
  props: EventCardSubmitButtonProps
) {
  const { loading, placeBet, selectedCompetition, guessOne, guessTwo, event } =
    props;

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
        disabled={loading}
        className="bg-casama-shiny rounded-xl hover:opacity-80 w-full py-1 text-lg my-2 no-toggle"
        onClick={placeBet}
      >
        Bet {amount} on {team}
      </button>
    </div>
  );
}
