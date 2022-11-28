import { Collapse, Divider } from '@mui/material';
import { useState } from 'react';
import { joinFreeRollCompetition } from '../../../../services/contract/betting/competitions';
import { currency, pluralize } from '../../../../services/formatter';
import { compAddr } from '../../../../services/memberHelpers';
import EventCardPredicitionInput from './predictionInput';
import EventCardVotePreview from './votePreview';

export default function EventCardFreeRollTile({
  competition,
  guessOne,
  guessTwo,
  setGuessOne,
  setGuessTwo,
  setLoading,
  scrollIntoView,
  setLoadingText,
  registerBet,
  handleError,
  user,
}) {
  const [selected, setSelected] = useState(false);

  const alreadyJoined = competition.games?.[0]?.participants?.find((p) =>
    compAddr(p.address, user.address)
  );
  const spotsLeft = competition.maxMembers - competition.members.length;
  const noSpotsLeft = spotsLeft <= 0;

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingText('Joining Free Roll Competition...');
    scrollIntoView();
    try {
      await joinFreeRollCompetition({
        competitionId: competition.id,
        userAddress: user.address,
      });
      await registerBet(competition.id, competition.games[0].id);
    } catch (joinError) {
      handleError(joinError);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl flex flex-col p-3 bg-shiny-gold">
      <h1 className="text-xl text-center font-semibold">
        Free Roll Competition
      </h1>
      <p className="text-center">
        Join for <b>free</b> with a Chance to win up to{' '}
        <b>{currency(competition.stake)}</b>!
      </p>
      {noSpotsLeft ? (
        <p className="text-center">
          No Spots Left. {alreadyJoined ? '' : 'Try your luck next time'}
        </p>
      ) : (
        <p className="text-center">
          <b>{spotsLeft}</b> {pluralize(spotsLeft, 'Spot')} left
        </p>
      )}
      <Divider className="w-full mt-3" />
      {noSpotsLeft ? (
        <EventCardVotePreview
          participants={competition.games[0].participants}
        />
      ) : (
        <>
          <Collapse in={!selected}>
            <div className="w-full flex flex-col">
              <EventCardVotePreview
                participants={competition.games[0].participants}
              />
              <button
                togglable="false"
                disabled={alreadyJoined}
                className="self-center bg-black rounded-xl text-white py-2 px-3 mt-3"
                onClick={() => setSelected(true)}
              >
                {alreadyJoined ? 'Already Joined' : 'Place Bet'}
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
            <div className="w-full flex flex-col">
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
  );
}
