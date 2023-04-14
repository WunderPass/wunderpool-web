import { Collapse, Divider } from '@mui/material';
import { SelectedCompetitionParams } from '.';
import { FormattedEvent } from '../../../../services/bettingHelpers';
import EventCardPredicitionInput from './predictionInput';
import EventCardSubmitButton from './submitButton';

type EventCardPrivateGameTileProps = {
  selectedCompetition: SelectedCompetitionParams;
  showCustomInput: boolean;
  stake: number;
  event: FormattedEvent;
  guessOne: string | number;
  guessTwo: string | number;
  setGuessOne: (val: string | number) => void;
  setGuessTwo: (val: string | number) => void;
  loading?: boolean;
  placeBet: () => void;
  toggleSelectedCompetition: (
    params: SelectedCompetitionParams,
    fromCustom?: boolean
  ) => void;
};

export default function EventCardPrivateGameTile(
  props: EventCardPrivateGameTileProps
) {
  const {
    selectedCompetition = {},
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
  } = props;

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
              } no-toggle`}
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
