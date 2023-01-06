import { Collapse, Divider } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import TransactionFrame from '/components/general/utils/transactionFrame';
import {
  createSingleCompetition,
  joinSingleCompetition,
} from '/services/contract/betting/competitions';
import Header from './header';
import MultiCardFooter from './footer';
import MagicMomentDialog from './magicMomentDialog';
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

  const eventCompetitions = bettingService.publicCompetitions.filter(
    (comp) =>
      comp.games.length == 1 &&
      comp.games.find((g) => g.id && g.event.id == event.id)
  );

  const poolRequiresBet = eventCompetitions.find(
    (c) =>
      c.members.find((m) => compAddr(m.address, user.address)) &&
      !c.games[0].participants.find((p) => compAddr(p.address, user.address))
  );

  const summarizePredcitions = async () => {
    competition.games.map((game, i) => {
      let obj = {
        game_id: game.id,
        home_score: parseInt(guessOne[i]),
        away_score: parseInt(guessTwo[i]),
      };
      setBets((bets) => [...bets, obj]);
    });
  };

  const placeBet = async () => {
    //  competition.games.map(async (game, i) => {
    //   const { competitionId, blockchainId, gameId } =
    //     await joinPublicCompetition();
    await summarizePredcitions();
    const game = competition.games[0];
    console.log('cosnt game', game);
    if (game.event?.competitionId && game.event?.blockchainId && game.id) {
      if (user.loginMethod == 'Casama') {
        await registerBet(
          game.event.competitionId,
          game.event.blockchainId,
          game.id
        );
      } else {
        setLoading(false);
        setJoiningCompetitionId(game.event?.competitionId);
        setJoiningBlockchainId(game.event?.blockchainId);
        setJoiningGameId(game.event?.gameId);
      }
    } else {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(null);
    setLoadingText(null);
    setShowDetails(false);
    setGuessOne('');
    setGuessTwo('');
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

  const joinPublicCompetition = async () => {
    setLoading(true);
    scrollIntoView();
    setLoadingText('Joining Public Competition...');
    if (selectedCompetition.matchingCompetition) {
      try {
        await joinSingleCompetition({
          userAddress: user.address,
          stake: selectedCompetition.matchingCompetition.stake,
          poolAddress: selectedCompetition.matchingCompetition.poolAddress,
          poolVersion: 'ETA',
        });
        return {
          competitionId: selectedCompetition.matchingCompetition.id,
          blockchainId: selectedCompetition.matchingCompetition.blockchainId,
          gameId: selectedCompetition.matchingCompetition.games[0].id,
        };
      } catch (error) {
        handleError(
          typeof error == 'string' ? error : 'Competition could not be joined',
          user.wunderId,
          user.userName
        );
        return {};
      }
    } else {
      try {
        const { competitionId, blockchainId, gameId } =
          await createSingleCompetition({
            event,
            stake: selectedCompetition.stake,
            creator: user.address,
            isPublic: true,
          });
        return { competitionId, blockchainId, gameId };
      } catch (error) {
        handleError(
          typeof error == 'string' ? error : 'Competition could not be joined',
          user.wunderId,
          user.userName
        );
        return {};
      }
    }
  };

  const registerBet = async (competitionId, blockchainId, gameId) => {
    console.log('gameID', gameId);
    setLoading(true);
    setLoadingText('Placing your Bet...');
    let success = false;
    console.log('bets herer', bets);
    try {
      await registerParticipantForMulti(
        competitionId || joiningCompetitionId,
        blockchainId,
        gameId || joiningGameId,
        [guessOne[0], guessTwo[0]],
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

  const toggleSelectedCompetition = (params, fromCustom = false) => {
    setShowCustomInput(fromCustom);

    setSelectedCompetition((comp) => {
      if (
        comp.stake != params.stake &&
        params.stake &&
        Number(params.stake) > user.usdBalance
      )
        user.setTopUpRequired(true);
      return comp.stake == params.stake && comp.public == params.public
        ? {}
        : params;
    });
  };

  const handleToggle = (e) => {
    if (e.target.getAttribute('togglable') == 'false') return;
    setShowDetails(!showDetails);
    setTimeout(() => scrollIntoView(), 50);
  };

  return (
    <>
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
            ) : poolRequiresBet ? (
              <>
                <Divider />
                <div className="my-3">
                  <div className="flex flex-col justify-center items-center text-semibold sm:text-lg gap-1">
                    There seemed to be an Error last time you tried to bet.
                    Please enter your Bet for the{' '}
                    {currency(poolRequiresBet.stake)} Competition again.
                    <div className="w-full max-w-sm">
                      {/* <EventCardPredicitionInput
                        event={event}
                        loading={loading}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                      /> */}
                    </div>
                    <button
                      togglable="false"
                      disabled={loading}
                      className="btn-casama py-2 px-3 text-lg w-full max-w-sm"
                      onClick={() =>
                        registerBet(
                          poolRequiresBet.id,
                          poolRequiresBet.blockchainId,
                          poolRequiresBet.games[0].id
                        )
                      }
                    >
                      Confirm Bet
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Collapse in={showDetails}>
                <Divider className="mt-6" />
                <div className="my-5">
                  <div className="flex justify-center items-center text-semibold sm:text-lg">
                    <p className="text-xl text-casama-blue font-medium">
                      Place your bets
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    <MultiCardPredicitionInput
                      competition={competition}
                      event={event}
                      loading={loading}
                      guessOne={guessOne}
                      guessTwo={guessTwo}
                      setGuessOne={setGuessOne}
                      setGuessTwo={setGuessTwo}
                    />
                  </div>

                  <div className="flex justify-center items-center w-full">
                    {guessOne && guessTwo && (
                      <MultiCardSubmitButton
                        loading={loading}
                        placeBet={placeBet}
                        selectedCompetition={competition}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        event={event}
                      />
                    )}
                  </div>
                  <Divider className="mt-6" />
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
      {/* <MagicMomentDialog
        open={showSuccess}
        setOpen={setShowSuccess}
        reset={reset}
        guessOne={guessOne}
        guessTwo={guessTwo}
        event={event}
      /> */}
    </>
  );
}
