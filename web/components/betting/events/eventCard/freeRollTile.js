import { Collapse, Divider } from '@mui/material';
import { useState } from 'react';
import { joinFreeRollCompetition } from '../../../../services/contract/betting/competitions';
import { currency, pluralize } from '../../../../services/formatter';
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
    <>
      <div className="rounded-xl flex flex-col h-auto py-3 bg-gray-700  bg-wrap text-gold text-xl sm:text-3xl">
        {/* <div class="outer-border  ">
          <div class="mid-border"> */}
        <img
          className="bg-soccer2 mb-0.5 "
          src="https://img.freepik.com/premium-photo/football-field-soccer-field-background-green-lawn-court-create-game_64749-2034.jpg?w=1480"
          alt="soccer field"
        />
        {/* <img
              className="absolute w-11/12 h-80 z-10 opacity-40 "
              src="/soccer2.png"
              alt="Football Ground Soccer Field Pitch Footbal - Soccer Field Black And White@clipartmax.com"
            /> */}
        {/* <div class="inner-border"> */}
        <div className="z-10">
          {/* <img
                  class="vertical-decoration top"
                  src="https://i.ibb.co/JRTK9z4/horizontally-centered-vertical-decoration.png"
                ></img>
                <img
                  class="vertical-decoration bottom"
                  src="https://i.ibb.co/JRTK9z4/horizontally-centered-vertical-decoration.png"
                ></img> */}
        </div>
        <div className="">
          {/* <img
                className="bg-soccer2 mb-0.5 "
                src="https://img.freepik.com/premium-photo/football-field-soccer-field-background-green-lawn-court-create-game_64749-2034.jpg?w=1480"
                alt="soccer field"
              /> */}
          <div className="p-3 bg-content text-gray-100 ">
            <h1 className="text-2xl sm:text-3xl text-center font-semibold mb-2 ">
              Freeroll Ticket
            </h1>
            <p className="text-center text-super">
              <b className="text-2xl sm:text-3xl font-semibold">
                {currency(competition.stake)}{' '}
              </b>
              Total Prize Pool!
            </p>
            {noSpotsLeft ? (
              <p className="text-center">
                No Spots Left.
                {alreadyJoined ? '' : ' Try your luck next time'}
              </p>
            ) : (
              <p className="text-center">
                <b className="font-semibold">{spotsLeft}</b>{' '}
                {pluralize(spotsLeft, 'Spot')} left
              </p>
            )}
            {!noSpotsLeft && (
              <>
                {/* <Divider className="w-full mt-3" />{' '} */}
                <Collapse in={!selected}>
                  <div className="w-full flex flex-col mt-4 ">
                    <EventCardVotePreview
                      participants={competition.games[0].participants}
                    />
                    <button
                      togglable="false"
                      disabled={!alreadyJoined}
                      className="self-center container-white-p-0 text-lg border-b rounded-xl text-white  py-2 px-3"
                      onClick={() => setSelected(true)}
                    >
                      {!alreadyJoined ? 'Already Joined' : 'Join for Free'}
                    </button>
                  </div>
                </Collapse>
                <Collapse in={selected}>
                  <div className="max-w-sm mx-auto ">
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
                      Join for Free
                    </button>
                  </div>
                </Collapse>
              </>
            )}
          </div>
          {/* </div>
          </div> */}
          {/* </div> */}
        </div>
      </div>
    </>
  );
}
