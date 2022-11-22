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

export default function EventCard(props) {
  const { event, bettingService, user } = props;
  const [eventCompetitions, setEventCompetitions] = useState([]);
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const cardRef = useRef(null);

  const placeBet = () => {
    if (selectedCompetition.public) {
      joinPublicCompetition();
    } else {
      createPrivateCompetition();
    }
  };

  const reset = () => {
    setLoading(null);
    setLoadingText(null);
    setShowDetails(false);
    setGuessOne('');
    setGuessTwo('');
    setSelectedCompetition({});
    setCustomAmount('');
    setShowCustomInput(false);
  };

  const scrollIntoView = () => {
    cardRef.current.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const joinPublicCompetition = () => {
    setLoading(true);
    scrollIntoView();
    setLoadingText('Joining Public Competition...');
    if (selectedCompetition.matchingCompetition) {
      joinSingleCompetition({
        competitionId: selectedCompetition.matchingCompetition.id,
        gameId: selectedCompetition.matchingCompetition.games[0].id,
        poolVersion: 'ETA',
        poolAddress: selectedCompetition.matchingCompetition.poolAddress,
        prediction: [guessOne, guessTwo],
        userAddress: user.address,
        stake: selectedCompetition.matchingCompetition.stake,
        event: event,
        afterPoolJoin: async () => {
          setLoadingText('Placing your Bet...');
        },
      })
        .then(() => {
          user.fetchUsdBalance();
          reset();
          setShowSuccess(true);
        })
        .catch((err) => {
          console.log(err);
        })
        .then(() => {
          setLoadingText(null);
          setLoading(false);
        });
    } else {
      createSingleCompetition({
        event,
        stake: selectedCompetition.stake,
        creator: user.address,
        isPublic: true,
        prediction: [guessOne, guessTwo],
        afterPoolCreate: async () => {
          setLoadingText('Placing your Bet...');
        },
      })
        .then(() => {
          user.fetchUsdBalance();
          reset();
          setShowSuccess(true);
        })
        .catch((err) => {
          console.log(err);
        })
        .then(() => {
          setLoadingText(null);
          setLoading(false);
        });
    }
  };

  const createPrivateCompetition = () => {
    setLoading(true);
    scrollIntoView();
    setLoadingText('Creating Private Competition...');
    createSingleCompetition({
      event,
      stake: selectedCompetition.stake || customAmount,
      creator: user.address,
      isPublic: false,
      prediction: [guessOne, guessTwo],
      afterPoolCreate: async () => {
        setLoadingText('Placing your Bet...');
      },
    })
      .then(() => {
        user.fetchUsdBalance();
        reset();
        setShowSuccess(true);
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        setLoadingText(null);
        setLoading(false);
      });
  };

  const toggleSelectedCompetition = (params, fromCustom = false) => {
    !fromCustom && setShowCustomInput(false);
    setSelectedCompetition((comp) =>
      comp.stake == params.stake && comp.public == params.public ? {} : params
    );
  };

  useEffect(() => {
    setEventCompetitions(
      bettingService.publicCompetitions.filter(
        (comp) =>
          comp.games.length == 1 &&
          comp.games.find((g) => g.event.id == event.id)
      )
    );
  }, [bettingService.isReady]);

  return (
    <>
      <div
        id={`${event.name}`}
        className={`container-white pb-16 ${
          showDetails ? '' : 'cursor-pointer'
        }`}
        ref={cardRef}
      >
        <div onClick={() => setShowDetails(true)}>
          <Header event={event} />
          <div className="mt-6">
            <TransactionFrame open={loading} text={loadingText} />
          </div>
          {!loading && (
            <>
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
                        user={user}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                        loading={loading}
                        placeBet={placeBet}
                        toggleSelectedCompetition={toggleSelectedCompetition}
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
                    />
                  </div>
                </div>
              </Collapse>
            </>
          )}
        </div>
        {showDetails && !loading && (
          <EventCardFooter
            scrollIntoView={scrollIntoView}
            setShowDetails={setShowDetails}
          />
        )}
      </div>
      <MagicMomentDialog
        open={showSuccess}
        setOpen={setShowSuccess}
        guessOne={guessOne}
        guessTwo={guessTwo}
        event={event}
      />
    </>
  );
}
