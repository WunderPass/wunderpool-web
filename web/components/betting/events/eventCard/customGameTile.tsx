import { Collapse, Divider } from '@mui/material';
import EventCardPredicitionInput from './predictionInput';
import EventCardSubmitButton from './submitButton';
import CustomInput from '../../../general/utils/customInputButton';
import { SelectedCompetitionParams } from '.';
import { FormattedEvent } from '../../../../services/bettingHelpers';

type EventCardCustomGameTileProps = {
  selectedCompetition: SelectedCompetitionParams;
  showCustomInput: boolean;
  customAmount: string;
  setShowCustomInput: (val: boolean) => void;
  setCustomAmount: (val: string) => void;
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

export default function EventCardCustomGameTile(
  props: EventCardCustomGameTileProps
) {
  const {
    selectedCompetition = {},
    showCustomInput,
    customAmount,
    setShowCustomInput,
    setCustomAmount,
    event,
    guessOne,
    guessTwo,
    setGuessOne,
    setGuessTwo,
    loading,
    placeBet,
    toggleSelectedCompetition,
  } = props;

  return (
    <div className="w-full">
      <div className="w-full p-3">
        {guessOne && guessTwo && showCustomInput ? (
          <EventCardSubmitButton
            loading={loading}
            placeBet={placeBet}
            selectedCompetition={selectedCompetition}
            guessOne={guessOne}
            guessTwo={guessTwo}
            event={event}
          />
        ) : (
          <>
            <CustomInput
              className="bg-casama-blue text-white"
              show={showCustomInput}
              value={customAmount}
              placeholder="$ 50"
              onClickAway={() => {
                if (!customAmount) {
                  setShowCustomInput(false);
                  toggleSelectedCompetition({}, true);
                }
              }}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                toggleSelectedCompetition(
                  {
                    stake: Number(e.target.value),
                    public: false,
                  },
                  true
                );
              }}
            />
            {!showCustomInput && (
              <button
                className={`btn-casama w-full py-1 text-lg my-2 ${
                  selectedCompetition.stake == undefined
                    ? 'opacity-100'
                    : 'opacity-40'
                } no-toggle`}
                onClick={() => setShowCustomInput(true)}
              >
                $ Custom
              </button>
            )}
          </>
        )}
      </div>
      <Collapse in={showCustomInput}>
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
  );
}
