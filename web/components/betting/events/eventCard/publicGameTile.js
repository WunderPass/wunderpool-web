import { Collapse, Divider } from '@mui/material';
import { currency } from '../../../../services/formatter';
import {
  compAddr,
  showWunderIdsAsIcons,
} from '../../../../services/memberHelpers';
import EventCardPredicitionInput from './predictionInput';
import EventCardSubmitButton from './submitButton';
import { GoPerson } from 'react-icons/go';
import { FaMedal } from 'react-icons/fa';

function sortMembersOnVotes(participants) {
  let votes = null;
  if (!participants) return votes;
  if (participants.length > 0) {
    votes = [[], [], []];
    participants.forEach((p) => {
      if (Number(p.prediction[0]) > Number(p.prediction[1])) {
        votes[0].push(p);
      } else if (Number(p.prediction[0]) == Number(p.prediction[1])) {
        votes[1].push(p);
      } else if (Number(p.prediction[0]) < Number(p.prediction[1])) {
        votes[2].push(p);
      }
    });
  }
  return votes;
}

export default function EventCardPublicGameTile({
  selectedCompetition,
  showCustomInput,
  eventCompetitions,
  stake,
  event,
  user,
  guessOne,
  guessTwo,
  setGuessOne,
  setGuessTwo,
  loading,
  placeBet,
  toggleSelectedCompetition,
}) {
  const selected =
    selectedCompetition.public &&
    selectedCompetition.stake == stake &&
    !showCustomInput;
  const matchingCompetition = eventCompetitions.find(
    (comp) => comp.stake == stake
  );
  const participants = matchingCompetition?.games?.[0]?.participants;
  const votes = sortMembersOnVotes(participants);

  const maxMembersAccordingToStake = (stake) => {
    let maxMembers = 50;
    switch (stake) {
      case 5:
        maxMembers = 50;
        break;
      case 10:
        maxMembers = 25;
        break;
      case 50:
        maxMembers = 10;
        break;
      default:
        maxMembers = 50;
    }
    return maxMembers;
  };

  return (
    <div
      className={`flex flex-col container-casama-light-p-0 overflow-hidden items-between w-full ${
        selectedCompetition.stake == undefined || selected
          ? 'opacity-100'
          : 'opacity-40'
      }`}
    >
      <div className="flex flex-col items-center p-2 gap-2">
        <div className="flex flex-row justify-between items-center w-full px-3  mt-2 sm:px-2">
          <div className="flex flex-row">
            <div className="flex flex-row justify-center items-center">
              <FaMedal className="text-base text-yellow-600 mb-0.5 mr-1" />
              <p className="font-semibold  ">
                {currency(
                  matchingCompetition?.stake *
                    matchingCompetition?.games?.[0]?.participants?.length || 0
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="font-semibold ml-1.5">
              <div className="flex flex-row items-center justify-center">
                <GoPerson className="text-base text-casama-blue mb-0.5 mr-1" />
                {matchingCompetition
                  ? `${Math.max(
                      0,
                      participants?.length
                    )} / ${maxMembersAccordingToStake(stake)}`
                  : '0 /' + `${maxMembersAccordingToStake(stake)}`}
              </div>
            </div>
          </div>
        </div>

        {participants?.length >= maxMembersAccordingToStake(stake) ? (
          <button
            togglable="false"
            disabled
            className="btn-casama px-4 sm:px-6 py-1 text-lg w-full"
          >
            $ {stake} (No Spots Left)
          </button>
        ) : participants?.find((part) =>
            compAddr(part.address, user.address)
          ) ? (
          <button
            togglable="false"
            disabled
            className="btn-casama px-4 sm:px-6 py-1 text-lg w-full"
          >
            $ {stake} (Joined)
          </button>
        ) : guessOne && guessTwo && selected ? (
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
            togglable="false"
            onClick={() =>
              toggleSelectedCompetition({
                stake,
                public: true,
                matchingCompetition,
              })
            }
            className="btn-casama p-1 text-lg w-full"
          >
            $ {stake}
          </button>
        )}
      </div>
      <Divider />
      <Collapse in={!selected}>
        {votes != null && (
          <div className="w-full flex justify-around p-1 ">
            <div className="w-full text-center">
              <p>Home</p>
              <div className="flex flex-row justify-center items-center ml-2 my-1">
                {showWunderIdsAsIcons(votes[0], 2)}
              </div>
            </div>
            <div className="w-full text-center">
              <p>Tie</p>
              <div className="flex flex-row justify-center items-center ml-2 my-1">
                {showWunderIdsAsIcons(votes[1], 2)}
              </div>
            </div>

            <div className="w-full text-center">
              <p>Away</p>
              <div className="flex flex-row justify-center items-center ml-2 my-1">
                {showWunderIdsAsIcons(votes[2], 2)}
              </div>
            </div>
          </div>
        )}
      </Collapse>
      <Collapse in={selected}>
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
