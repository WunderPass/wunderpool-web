import { Collapse, Divider } from '@mui/material';
import { useState, useRef } from 'react';
import Header from './header';
import EventCardFooter from './footer';
import EventCardPublicGameTile from './publicGameTile';
import EventCardPrivateGameTile from './privateGameTile';
import EventCardCustomGameTile from './customGameTile';
import MagicMomentDialog from './magicMomentDialog';
import ReactourTarget from '../../../general/utils/reactourTarget';

export default function DemoEventCard(props) {
  const {
    event,
    eventCompetitions,
    user,
    showDetails,
    setShowDetails,
    guessOne,
    guessTwo,
    setGuessOne,
    setGuessTwo,
    showSuccess,
    setShowSuccess,
    selectedCompetition,
    setSelectedCompetition,
  } = props;

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const cardRef = useRef(null);

  const placeBet = async () => {
    scrollIntoView();
    setShowSuccess(true);
  };

  const reset = () => {
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
      <ReactourTarget name="event-card">
        <div className="container-white pb-16 cursor-pointer relative">
          <div ref={cardRef} className="absolute -top-12" />
          <div onClick={handleToggle}>
            <Header event={event} />
            <Collapse in={showDetails}>
              <Divider className="mt-6" />
              <div className="my-5">
                <div className="flex justify-center items-center text-semibold sm:text-lg mb-4">
                  Public Betting Games
                </div>
                <div>
                  <ReactourTarget name="public-games">
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
                          placeBet={placeBet}
                          toggleSelectedCompetition={toggleSelectedCompetition}
                        />
                      ))}
                    </div>
                  </ReactourTarget>
                </div>
              </div>
              <Divider />
              <div className="flex flex-col justify-center items-center mt-5">
                <div className=" flex-col text-semibold sm:text-lg text-center mb-4">
                  <p>Create a private Betting Game</p>
                </div>
                <ReactourTarget name="private-games">
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
                      placeBet={placeBet}
                      toggleSelectedCompetition={toggleSelectedCompetition}
                    />
                  </div>
                </ReactourTarget>
              </div>
            </Collapse>
          </div>
          {showDetails && (
            <EventCardFooter
              scrollIntoView={scrollIntoView}
              setShowDetails={setShowDetails}
            />
          )}
        </div>
      </ReactourTarget>
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
