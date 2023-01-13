import { Collapse, Divider } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import TransactionFrame from '/components/general/utils/transactionFrame';
import {
  createSingleCompetition,
  joinSingleCompetition,
} from '/services/contract/betting/competitions';
import Body from './body';
import Header from './header';
import MultiCardFooter from './footer';
import MagicMomentMultiDialog from './magicMomentMultiDialog';
import { registerParticipantForMulti } from '../../../../services/contract/betting/games';
import { useMemo } from 'react';
import { compAddr } from '../../../../services/memberHelpers';
import MultiCardPredicitionInput from './predictionInput';
import MultiCardSubmitButton from './submitButton';
import { currency } from '../../../../services/formatter';

export default function MultiCard(props) {
  const { event, bettingService, user, handleError, competition } = props;
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [guessOne, setGuessOne] = useState([]);
  const [guessTwo, setGuessTwo] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [joiningCompetitionId, setJoiningCompetitionId] = useState(null);
  const [joiningBlockchainId, setJoiningBlockchainId] = useState(null);
  const [joiningGameId, setJoiningGameId] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [bets, setBets] = useState([]);

  const cardRef = useRef(null);

  const mustClickAgain = useMemo(
    () => joiningCompetitionId && joiningGameId,
    [joiningCompetitionId, joiningGameId]
  );

  useEffect(() => {
    if (
      guessOne.length === competition.games.length &&
      guessTwo.length === competition.games.length
    )
      summarizePredcitions();
  }, [guessOne, guessTwo]);

  const summarizePredcitions = async () => {
    setBets([]);
    competition.games.map((game, i) => {
      if (game.state === 'UPCOMING') {
        let obj = {
          game_id: game.id,
          home_score: parseInt(guessOne[i]),
          guest_score: parseInt(guessTwo[i]),
        };
        setBets((bets) => [...bets, obj]);
      }
    });
  };

  const placeBet = async () => {
    const game = competition.games[0];
    var gameIds = [];
    competition.games.map((game) => {
      if (game.state === 'UPCOMING') gameIds.push(game.id);
    });
    await joinPublicCompetition(competition, gameIds);

    if (competition.competitionId && game.event?.blockchainId && game.id) {
      if (user.loginMethod == 'Casama') {
        await registerBet(
          competition.competitionId,
          competition.blockchainId,
          gameIds
        );
      } else {
        setJoiningCompetitionId(competition.competitionId);
        setJoiningBlockchainId(competition.blockchainId);
        setJoiningGameId(gameIds);
      }
    } else {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(null);
    setLoadingText(null);
    setShowDetails(false);
    setGuessOne([]);
    setGuessTwo([]);
    setJoiningCompetitionId(null);
    setJoiningBlockchainId(null);
    setJoiningGameId(null);
    setSelectedCompetition({});
    setCustomAmount('');
    setShowCustomInput(false);
  };

  const scrollIntoView = () => {
    cardRef.current.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const joinPublicCompetition = async (competition, gameIds) => {
    console.log('competition', competition);
    setLoading(true);
    scrollIntoView();
    setLoadingText('Joining Public Competition...');

    try {
      await joinSingleCompetition({
        userAddress: user.address,
        stake: competition.stake,
        poolAddress: competition.poolAddress,
        poolVersion: 'ETA',
      });
      return {
        competitionId: competition.competitionId,
        blockchainId: competition.blockchainId,
        gameId: gameIds,
      };
    } catch (error) {
      console.log(error);
      handleError(
        typeof error == 'string' ? error : 'Competition could not be joined',
        user.wunderId,
        user.userName
      );
      return {};
    }
  };

  const registerBet = async (competitionId, blockchainId, gameIds) => {
    console.log('gameIDs', gameIds);
    setLoading(true);
    setLoadingText('Placing your Bet...');
    let success = false;
    console.log('bets here', bets);
    try {
      await registerParticipantForMulti(
        competitionId || joiningCompetitionId,
        blockchainId,
        gameIds || joiningGameId,
        user.address,
        competition.games[0].event.version,
        bets
      );

      success = true;
      setShowSuccess(true);
    } catch (error) {
      console.log(error);
      handleError(error, user.wunderId, user.userName);
    }
    user.fetchUsdBalance();
    bettingService.reFetchCompetition(
      competitionId || joiningCompetitionId,
      3000
    );
    setLoadingText(null);
    setLoading(false);
    return success;
  };

  const handleToggle = (e) => {
    if (e.target.getAttribute('togglable') == 'false') return;
    setShowDetails(!showDetails);
    setTimeout(() => scrollIntoView(), 50);
  };

  return (
    <>
      {competition.games.length > 1 && (
        <div className="container-white pb-16 cursor-pointer relative">
          <div ref={cardRef} className="absolute -top-12" />
          <div onClick={(e) => handleToggle(e)}>
            <Header competition={competition} />

            <div className="mt-6">
              <TransactionFrame open={loading} text={loadingText} />
            </div>
            {!loading &&
              (mustClickAgain ? (
                <Collapse in={true}>
                  <Divider className="mt-6" />
                  <div className="my-5">
                    <div className="flex flex-col justify-center items-center text-semibold sm:text-lg gap-3">
                      Click here to Confirm your Bet on Chain
                      <button
                        togglable="false"
                        disabled={loading}
                        className="btn-casama py-2 px-3 text-lg"
                        onClick={() =>
                          registerBet(
                            joiningCompetitionId,
                            joiningBlockchainId,
                            joiningGameId
                          )
                        }
                      >
                        Confirm my Bet
                      </button>
                    </div>
                  </div>
                </Collapse>
              ) : (
                <Collapse in={showDetails}>
                  <Body
                    competition={competition}
                    guessOne={guessOne}
                    guessTwo={guessTwo}
                    setGuessOne={setGuessOne}
                    setGuessTwo={setGuessTwo}
                  />
                  <div className="flex flex-col justify-center items-center w-full">
                    <p>(Enter your score predictions for all games)</p>

                    <div className="flex items-center justify-center mb-5 w-full">
                      <div className="flex justify-center items-center text-semibold sm:text-lg"></div>
                      {/* <div className="flex flex-col gap-3 mt-4">
                      <MultiCardPredicitionInput
                        competition={competition}
                        event={event}
                        loading={loading}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                      />
                    </div> */}
                      <div className="flex justify-center items-center sm:w-1/2 w-full">
                        {guessOne && guessTwo && (
                          <MultiCardSubmitButton
                            disabled={
                              !(
                                guessOne.length === competition.games.length &&
                                guessTwo.length === competition.games.length
                              )
                            }
                            loading={loading}
                            placeBet={placeBet}
                            competition={competition}
                            guessOne={guessOne}
                            guessTwo={guessTwo}
                          />
                        )}
                      </div>
                      <Divider className="mt-6" />
                    </div>
                  </div>
                </Collapse>
              ))}
          </div>
          {/* {showDetails && !loading && !mustClickAgain && (
          <EventCardFooter
            scrollIntoView={scrollIntoView}
            setShowDetails={setShowDetails}
          />
        )} */}
        </div>
      )}
      <MagicMomentMultiDialog //TODO TEST MAGIC MOMENT FOR MULTI COMPETITION
        open={showSuccess}
        setOpen={setShowSuccess}
        reset={reset}
        competition={competition}
      />
    </>
  );
}
