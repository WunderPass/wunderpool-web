import { Collapse, Divider } from '@mui/material';
import { useState } from 'react';
import { joinFreeRollCompetition } from '../../../../services/contract/betting/competitions';
import { currency } from '../../../../services/formatter';
import { compAddr } from '../../../../services/memberHelpers';
import EventCardPredicitionInput from './predictionInput';
import EventCardVotePreview from './votePreview';
import ButtonPic from '../../../../public/buttonFreeRoll.png';
import CasamaIcon from '/public/casama_logo_white.png';

export default function EventCardFreeRollTile({
  competition,
  guessOne,
  guessTwo,
  setGuessOne,
  setGuessTwo,
  setLoading,
  scrollIntoView,
  setLoadingText,
  handleError,
  user,
}) {
  const [selected, setSelected] = useState(false);

  const alreadyJoined = competition.games?.[0]?.participants?.find((p) =>
    compAddr(p.address, user.address)
  );

  const noSpotsLeft = competition.members.length >= competition.maxMembers;

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingText('Joining Free Roll Competition...');
    scrollIntoView();
    try {
      await joinFreeRollCompetition({
        competitionId: competition.id,
        userAddress: user.address,
      });
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="rounded-xl flex flex-col py-3 bg-gold text-gold text-3xl">
        <div class="outer-border">
          <div class="mid-border">
            <div class="inner-border">
              <div className="z-1">
                <img
                  class="vertical-decoration top"
                  src="https://i.ibb.co/JRTK9z4/horizontally-centered-vertical-decoration.png"
                ></img>
                <img
                  class="vertical-decoration bottom"
                  src="https://i.ibb.co/JRTK9z4/horizontally-centered-vertical-decoration.png"
                ></img>
              </div>
              <div className="p-3 z-20">
                <h1 className="text-4xl text-center font-bold text-gray-900">
                  Free Roll Competition
                </h1>
                <p className="text-center text-super">
                  Join for <b>free</b> with a Chance to win{' '}
                  <b className="text-4xl font-super">
                    {currency(competition.stake)}
                  </b>
                  !
                </p>
                {noSpotsLeft ? (
                  <p className="text-center">
                    No Spots Left.{' '}
                    {alreadyJoined ? '' : 'Try your luck next time'}
                  </p>
                ) : (
                  <p className="text-center">
                    <b>{competition.maxMembers - competition.members.length}</b>{' '}
                    Spots left
                  </p>
                )}
                {!noSpotsLeft && (
                  <>
                    <Divider className="w-full mt-3" />{' '}
                    <Collapse in={!selected}>
                      <div className="w-full flex flex-col mt-4 ">
                        <EventCardVotePreview
                          participants={competition.games[0].participants}
                        />
                        <button
                          togglable="false"
                          disabled={alreadyJoined}
                          className="self-center bg-black rounded-xl text-white py-2 px-3"
                          onClick={() => setSelected(true)}
                        >
                          Place Bet {alreadyJoined ? ' (Joined)' : ''}
                        </button>
                      </div>
                    </Collapse>
                    <Collapse in={selected}>
                      <div className="max-w-sm mx-auto">
                        <EventCardPredicitionInput
                          color="text-black"
                          event={competition.games[0].event}
                          guessOne={guessOne}
                          guessTwo={guessTwo}
                          setGuessOne={setGuessOne}
                          setGuessTwo={setGuessTwo}
                        />
                      </div>
                      <div className="w-full flex flex-col mt-4 ">
                        <button
                          togglable="false"
                          disabled={!Boolean(guessOne && guessTwo)}
                          className="self-center bg-black rounded-xl text-white py-2 px-3"
                          onClick={handleSubmit}
                        >
                          Place Bet
                        </button>
                      </div>
                    </Collapse>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
