import { Collapse, Divider } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import TransactionFrame from '/components/general/utils/transactionFrame';
import {
  createSingleCompetition,
  joinSingleCompetition,
} from '/services/contract/betting/competitions';
import Header from './header';
import EventCardFooter from './footer';
import EventCardPublicGameTile from './publicGameTile';
import EventCardPrivateGameTile from './privateGameTile';
import EventCardCustomGameTile from './customGameTile';
import MagicMomentDialog from './magicMomentDialog';
import { registerParticipant } from '../../../../services/contract/betting/games';
import { useMemo } from 'react';

export default function EventCard(props) {
  const { event, bettingService, user, handleError } = props;
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [joiningCompetitionId, setJoiningCompetitionId] = useState(null);
  const [joiningGameId, setJoiningGameId] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const cardRef = useRef(null);

  const mustClickAgain = useMemo(
    () => joiningCompetitionId && joiningGameId,
    [joiningCompetitionId, joiningGameId]
  );

  const eventCompetitions = bettingService.publicCompetitions.filter(
    (comp) =>
      comp.games.length == 1 && comp.games.find((g) => g.event.id == event.id)
  );

  const placeBet = async () => {
    const { competitionId, gameId } = selectedCompetition.public
      ? await joinPublicCompetition()
      : await createPrivateCompetition();
    if (competitionId && gameId) {
      if (user.loginMethod == 'Casama') {
        await registerBet(competitionId, gameId);
      } else {
        setLoading(false);
        setJoiningCompetitionId(competitionId);
        setJoiningGameId(gameId);
      }
    } else {
      setLoading(false);
      handleError('Betting Pool could not be joined');
    }
  };

  const reset = () => {
    setLoading(null);
    setLoadingText(null);
    setShowDetails(false);
    setGuessOne('');
    setGuessTwo('');
    setJoiningCompetitionId(null);
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
          gameId: selectedCompetition.matchingCompetition.games[0].id,
        };
      } catch (error) {
        console.log(error);
        return {};
      }
    } else {
      try {
        const { competitionId, gameId } = await createSingleCompetition({
          event,
          stake: selectedCompetition.stake,
          creator: user.address,
          isPublic: true,
        });
        return { competitionId, gameId };
      } catch (error) {
        console.log(error);
        return {};
      }
    }
  };

  const createPrivateCompetition = async () => {
    setLoading(true);
    scrollIntoView();
    setLoadingText('Creating Private Competition...');
    try {
      const { competitionId, gameId } = await createSingleCompetition({
        event,
        stake: selectedCompetition.stake || customAmount,
        creator: user.address,
        isPublic: false,
      });
      return { competitionId, gameId };
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const registerBet = async (competitionId, gameId) => {
    setLoading(true);
    setLoadingText('Placing your Bet...');
    try {
      await registerParticipant(
        competitionId || joiningCompetitionId,
        gameId || joiningGameId,
        [guessOne, guessTwo],
        user.address,
        event.version
      );
      bettingService.reFetchCompetition(
        competitionId || joiningCompetitionId,
        3000
      );
      user.fetchUsdBalance();
      setShowSuccess(true);
      setLoadingText(null);
      setLoading(false);
      return true;
    } catch (error) {
      console.log(error);
      setLoadingText(null);
      setLoading(false);
      return false;
    }
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
  };

  return (
    <>
      <div
        id={`${event.name}`}
        className={`container-white pb-16 ${
          showDetails ? '' : 'cursor-pointer'
        }`}
        ref={cardRef}
      >
        <div onClick={(e) => handleToggle(e)}>
          <Header event={event} />
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
                        registerBet(joiningCompetitionId, joiningGameId)
                      }
                    >
                      Confirm my Bet
                    </button>
                  </div>
                </div>
              </Collapse>
            ) : (
              <Collapse in={showDetails}>
                <Divider className="mt-6" />
                <div className="my-5">
                  <div className="flex justify-center items-center text-semibold sm:text-lg mb-4">
                    Public Betting Games
                  </div>
                  <div>
                    <div className="flex flex-row w-full gap-3 flex-wrap sm:flex-nowrap">
                      {[5, 10, 50].map((stake) => (
                        <EventCardPublicGameTile
                          key={`public-competition-${event.id}-${stake}`}
                          selectedCompetition={selectedCompetition}
                          showCustomInput={showCustomInput}
                          eventCompetitions={eventCompetitions}
                          stake={stake}
                          event={event}
                          user={user}
                          guessOne={guessOne}
                          guessTwo={guessTwo}
                          setGuessOne={setGuessOne}
                          setGuessTwo={setGuessTwo}
                          loading={loading}
                          placeBet={placeBet}
                          toggleSelectedCompetition={toggleSelectedCompetition}
                          mustClickAgain={mustClickAgain}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="flex flex-col justify-center items-center mt-5">
                  <div className=" flex-col text-semibold sm:text-lg text-center mb-4">
                    <p>Create a private Betting Game</p>
                  </div>
                  <div className="flex flex-col sm:flex-row w-full gap-5 sm:gap-3 ">
                    {[5, 10].map((stake) => (
                      <EventCardPrivateGameTile
                        key={`private-competition-${event.id}-${stake}`}
                        selectedCompetition={selectedCompetition}
                        showCustomInput={showCustomInput}
                        stake={stake}
                        event={event}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                        loading={loading}
                        placeBet={placeBet}
                        toggleSelectedCompetition={toggleSelectedCompetition}
                        mustClickAgain={mustClickAgain}
                      />
                    ))}
                    <EventCardCustomGameTile
                      selectedCompetition={selectedCompetition}
                      showCustomInput={showCustomInput}
                      customAmount={customAmount}
                      setShowCustomInput={setShowCustomInput}
                      setCustomAmount={setCustomAmount}
                      event={event}
                      guessOne={guessOne}
                      guessTwo={guessTwo}
                      setGuessOne={setGuessOne}
                      setGuessTwo={setGuessTwo}
                      loading={loading}
                      placeBet={placeBet}
                      toggleSelectedCompetition={toggleSelectedCompetition}
                      mustClickAgain={mustClickAgain}
                    />
                  </div>
                </div>
              </Collapse>
            ))}
        </div>
        {showDetails && !loading && !mustClickAgain && (
          <EventCardFooter
            scrollIntoView={scrollIntoView}
            setShowDetails={setShowDetails}
          />
        )}
      </div>
      <MagicMomentDialog
        open={showSuccess}
        setOpen={setShowSuccess}
        reset={reset}
        guessOne={guessOne}
        guessTwo={guessTwo}
        event={event}
      />
    </>
  );
}
