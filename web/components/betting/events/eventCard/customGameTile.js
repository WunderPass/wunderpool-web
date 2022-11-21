import { Collapse, Divider } from '@mui/material';
import EventCardPredicitionInput from './predictionInput';
import EventCardSubmitButton from './submitButton';
import CustomInput from '/components/general/utils/customInputButton';

export default function EventCardCustomGameTile({
  selectedCompetition,
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
}) {
  return (
    <div className="flex flex-col w-full container-casama-light-p-0 ">
      <div className=" w-full p-3">
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
                    stake: e.target.value,
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
                }`}
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
