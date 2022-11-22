import { Collapse, Divider } from '@mui/material';
import EventCardPredicitionInput from './predictionInput';
import EventCardSubmitButton from './submitButton';

export default function EventCardPrivateGameTile({
  selectedCompetition,
  showCustomInput,
  stake,
  event,
  guessOne,
  guessTwo,
  setGuessOne,
  setGuessTwo,
  loading,
  placeBet,
  toggleSelectedCompetition,
}) {
  const selected =
    !selectedCompetition.public &&
    selectedCompetition.stake == stake &&
    !showCustomInput;
  return (
    <div className="flex flex-col w-full container-casama-light-p-0 ">
      <div>
        <div className=" w-full p-3">
          {guessOne && guessTwo && selected ? (
            <EventCardSubmitButton
              loading={loading}
              placeBet={placeBet}
              selectedCompetition={selectedCompetition}
              guessOne={guessOne}
              guessTwo={guessTwo}
              event={event}
            />
          ) : (
            <button
              className={`btn-casama w-full py-1 text-lg my-2 ${
                selectedCompetition.stake == undefined || selected
                  ? 'opacity-100'
                  : 'opacity-40'
              }`}
              onClick={() =>
                toggleSelectedCompetition({
                  stake: stake,
                  public: false,
                })
              }
            >
              $ {stake}
            </button>
          )}
        </div>

        <Collapse in={selected}>
          <Divider className="w-full" />
          <EventCardPredicitionInput
            event={event}
            loading={loading}
            guessOne={guessOne}
            guessTwo={guessTwo}
            setGuessOne={setGuessOne}
            setGuessTwo={setGuessTwo}
          />
        </Collapse>
      </div>
    </div>
  );
}
