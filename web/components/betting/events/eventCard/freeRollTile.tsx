import { Collapse, Divider } from '@mui/material';
import { useState } from 'react';
import { joinFreeRollCompetition } from '../../../../services/contract/betting/competitions';
import { currency } from '../../../../services/formatter';
import { compAddr } from '../../../../services/memberHelpers';
import EventCardPredicitionInput from './predictionInput';
import EventCardVotePreview from './votePreview';
import { GoPerson } from 'react-icons/go';
import { FaMedal } from 'react-icons/fa';
import { FormattedCompetition } from '../../../../services/bettingHelpers';
import { UseNotification } from '../../../../hooks/useNotification';
import { UseUserType } from '../../../../hooks/useUser';

type EventCardFreeRollTileProps = {
  competition: FormattedCompetition;
  guessOne: string | number;
  guessTwo: string | number;
  setGuessOne: (val: string | number) => void;
  setGuessTwo: (val: string | number) => void;
  setLoading: (loading: boolean) => void;
  scrollIntoView: () => void;
  setLoadingText: (text: string) => void;
  registerBet: (
    competitionId: number,
    blockchainId: number,
    gameId: number
  ) => Promise<boolean>;
  handleError: UseNotification.handleError;
  user: UseUserType;
};

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
}: EventCardFreeRollTileProps) {
  const [selected, setSelected] = useState(false);

  const alreadyJoined = Boolean(
    competition.games?.[0]?.participants?.find((p) =>
      compAddr(p.address, user.address)
    )
  );
  const spotsLeft = competition.maxMembers - competition.members.length;
  const noSpotsLeft = spotsLeft <= 0;

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingText('Joining Free Roll Competition...');
    scrollIntoView();
    try {
      await joinFreeRollCompetition({
        competitionId: competition.competitionId,
        userAddress: user.address,
      });
      await registerBet(
        competition.competitionId,
        competition.blockchainId,
        competition.games[0].id
      );
    } catch (joinError) {
      handleError(joinError, user.wunderId, user.userName);
    }
    setLoading(false);
  };
  return (
    <>
      <div className="rounded-xl flex flex-col h-auto py-3 bg-gray-400  bg-wrap text-gold  text-md sm:text-xl">
        <img
          className="bg-soccer2 mb-0.5 "
          src="https://img.freepik.com/premium-photo/football-field-soccer-field-background-green-lawn-court-create-game_64749-2034.jpg?w=1480"
          alt="soccer field"
        />

        <div className="z-10"></div>
        <div className="">
          <div className="flex justify-center items-center p-3 bg-content ">
            <div className="text-black container-casama-light-p-0  rounded-xl w-11/12 sm:w-1/2 my-5">
              <h1 className="text-2xl py-2 text-gray-700 uppercase text-center bg-gold-shiny rounded-t-xl font-semibold mb-2  ">
                Freeroll Ticket
              </h1>
              <div className="flex flex-row justify-between items-center px-5">
                <p className="flex flex-row justify-center items-center text-center text-super">
                  <FaMedal className="text-xl text-yellow-600 mb-0.5 mr-1" />
                  <b className=" font-semibold">
                    {currency(competition.stake)}{' '}
                  </b>
                </p>
                {noSpotsLeft ? (
                  <p className="text-center">
                    No Spots Left.
                    {alreadyJoined ? '' : ' Try your luck next time'}
                  </p>
                ) : (
                  <p className="flex flex-row justify-center items-center text-center font-semibold">
                    <GoPerson className="text-xl text-casama-blue mb-0.5 mr-1" />
                    <b className="font-semibold">
                      {competition?.maxMembers - spotsLeft - 1}
                    </b>
                    <p className="mx-1"> / </p>
                    {competition?.maxMembers - 1}
                  </p>
                )}
              </div>
              {!noSpotsLeft && (
                <>
                  <Collapse in={!selected}>
                    <div className="w-full flex flex-col mt-4 ">
                      <button
                        disabled={alreadyJoined}
                        className="self-center btn-casama text-lg border-b rounded-xl text-white  py-1 px-3 no-toggle"
                        onClick={() => setSelected(true)}
                      >
                        {alreadyJoined ? 'Already Joined' : 'Join for Free'}
                      </button>
                      <Divider className="w-full mt-3" />{' '}
                      <EventCardVotePreview
                        participants={competition.games[0].participants}
                      />
                    </div>
                  </Collapse>
                  <Collapse in={selected}>
                    <div className="w-full flex flex-col mt-4 ">
                      <button
                        disabled={!Boolean(guessOne && guessTwo)}
                        className="self-center btn-casama text-lg rounded-xl  py-2 px-3 no-toggle"
                        onClick={handleSubmit}
                      >
                        Join for Free
                      </button>
                      <Divider className="w-full mt-3" />{' '}
                      <div className="max-w-sm mx-auto w-full ">
                        <EventCardPredicitionInput
                          color="text-black"
                          event={competition.games[0].event}
                          guessOne={guessOne}
                          guessTwo={guessTwo}
                          setGuessOne={setGuessOne}
                          setGuessTwo={setGuessTwo}
                        />
                      </div>
                    </div>
                  </Collapse>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
