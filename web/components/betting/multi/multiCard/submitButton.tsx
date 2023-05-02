import { currency } from '../../../../services/formatter';
import Link from 'next/link';
import { UseUserType } from '../../../../hooks/useUser';
import { FormattedCompetition } from '../../../../services/bettingHelpers';

type MulitCardSubmitButtonProps = {
  user: UseUserType;
  loading: boolean;
  placeBet: () => void;
  disabled: boolean;
  competition: FormattedCompetition;
};

export default function MulitCardSubmitButton({
  user,
  loading,
  placeBet,
  disabled,
  competition,
}: MulitCardSubmitButtonProps) {
  const hasPlacedBet = competition.games[0].participants.find(
    (p) => p.address == user.address
  );

  if (hasPlacedBet) {
    return (
      <div className="flex flex-col justify-center items-center w-full">
        <p className="mb-4 ">
          (You already placed your bets for this competition)
        </p>
        <div className="flex items-center justify-center w-full">
          <Link href={`/betting/bets`}>
            <button className="btn-casama rounded-xl hover:opacity-80 w-full py-3 text-lg my-2">
              <p className="text-2xl">View your placed bet</p>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full ">
      <div className="flex flex-col justify-center items-center w-full">
        <p className="flex flex-row mb-8">
          (Enter your score predictions for all
          <span className="font-medium mx-1">{competition.games.length}</span>
          matches)
        </p>

        <button
          disabled={loading || disabled}
          className={
            loading || disabled
              ? 'btn-casama rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
              : 'bg-casama-shiny rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
          }
          onClick={placeBet}
        >
          <p className="text-2xl">
            {`Place all your bets for ${currency(
              competition.stake / competition.games.length
            )} each`}
          </p>
        </button>
      </div>
    </div>
  );
}
