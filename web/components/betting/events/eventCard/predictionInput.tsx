import { FormattedEvent } from '../../../../services/bettingHelpers';

type EventCardPredictionInputProps = {
  event: FormattedEvent;
  loading?: boolean;
  guessOne: string | number;
  guessTwo: string | number;
  setGuessOne: (val: string | number) => void;
  setGuessTwo: (val: string | number) => void;
  color?: string;
};

export default function EventCardPredictionInput({
  event,
  loading,
  guessOne,
  guessTwo,
  setGuessOne,
  setGuessTwo,
  color = 'text-casama-blue',
}: EventCardPredictionInputProps) {
  return (
    <>
      <div className="flex items-center justify-center mt-4">
        <p className={`${color}`}>Your Prediciton</p>
      </div>

      <div className="flex flex-row justify-between w-full mb-3">
        <div className="w-full flex flex-col items-center justify-center">
          <div>{event?.teamHome?.shortName}</div>

          <div className="w-20">
            <input
              disabled={loading}
              inputMode="numeric"
              className="textfield text-center py-1 px-3 no-toggle"
              value={guessOne}
              onChange={(e) => setGuessOne(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <div>{event?.teamAway?.shortName}</div>
          <div className="w-20">
            <input
              disabled={loading}
              inputMode="numeric"
              className="textfield text-center py-1 px-3 no-toggle"
              value={guessTwo}
              onChange={(e) => setGuessTwo(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
