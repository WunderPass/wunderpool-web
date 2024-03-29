import { Collapse, Divider } from '@mui/material';
import { useState, useRef } from 'react';
import TransactionFrame from '../../../../components/general/utils/transactionFrame';
import {
  createSingleCompetition,
  joinSingleCompetition,
} from '../../../../services/contract/betting/competitions';
import Header from './header';
import EventCardPublicGameTile from './publicGameTile';
import EventCardCustomGameTile from './customGameTile';
import MagicMomentDialog from './magicMomentDialog';
import { registerParticipant } from '../../../../services/contract/betting/games';
import { useMemo } from 'react';
import { compAddr } from '../../../../services/memberHelpers';
import EventCardPredicitionInput from './predictionInput';
import { currency } from '../../../../services/formatter';
import EventCardFreeRollTile from './freeRollTile';
import {
  FormattedCompetition,
  FormattedEvent,
} from '../../../../services/bettingHelpers';
import { UseBettingService } from '../../../../hooks/useBettingService';
import { UseUserType } from '../../../../hooks/useUser';
import { UseNotification } from '../../../../hooks/useNotification';

export type SelectedCompetitionParams = {
  stake?: number;
  public?: boolean;
  matchingCompetition?: FormattedCompetition;
};

type EventCardProps = {
  event: FormattedEvent;
  bettingService: UseBettingService;
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function EventCard(props: EventCardProps) {
  const { event, bettingService, user, handleError } = props;
  const [loading, setLoading] = useState(null);
  const [loadingText, setLoadingText] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [guessOne, setGuessOne] = useState<number | string>('');
  const [guessTwo, setGuessTwo] = useState<number | string>('');
  const [selectedCompetition, setSelectedCompetition] =
    useState<SelectedCompetitionParams>({});

  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [joiningCompetitionId, setJoiningCompetitionId] = useState(null);
  const [joiningBlockchainId, setJoiningBlockchainId] = useState(null);
  const [joiningGameId, setJoiningGameId] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);

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

  const freeRoll = eventCompetitions.find((comp) => comp.sponsored);

  const poolRequiresBet = eventCompetitions.find(
    (c) =>
      c.members.find((m) => compAddr(m.address, user.address)) &&
      !c.games[0].participants.find((p) => compAddr(p.address, user.address))
  );

  const placeBet = async () => {
    if (new Date() > new Date(event.startTime)) {
      handleError('Game already started', user.wunderId, user.userName);
    } else {
      const { competitionId, blockchainId, gameId } = selectedCompetition.public
        ? await joinPublicCompetition()
        : await createPrivateCompetition();
      if (competitionId && blockchainId && gameId) {
        if (user.loginMethod == 'Casama') {
          await registerBet(competitionId, blockchainId, gameId);
        } else {
          setLoading(false);
          setJoiningCompetitionId(competitionId);
          setJoiningBlockchainId(blockchainId);
          setJoiningGameId(gameId);
        }
      } else {
        setLoading(false);
      }
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
          chain: selectedCompetition.matchingCompetition.games[0].event.chain,
        });
        return {
          competitionId: selectedCompetition.matchingCompetition.competitionId,
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
            chain: user.preferredChain,
            version: event.version,
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

  const createPrivateCompetition = async () => {
    setLoading(true);
    scrollIntoView();
    setLoadingText('Creating Private Competition...');
    try {
      const { competitionId, blockchainId, gameId } =
        await createSingleCompetition({
          event,
          stake: selectedCompetition.stake || Number(customAmount),
          creator: user.address,
          isPublic: false,
          chain: user.preferredChain,
          version: event.version,
        });
      return { competitionId, blockchainId, gameId };
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const registerBet = async (
    competitionId: number,
    blockchainId: number,
    gameId: number
  ) => {
    setLoading(true);
    setLoadingText('Placing your Bet...');
    let success = false;
    try {
      await registerParticipant(
        competitionId || joiningCompetitionId,
        blockchainId,
        gameId || joiningGameId,
        [Number(guessOne), Number(guessTwo)],
        user.address,
        event.version,
        event.chain
      );
      success = true;
      setShowSuccess(true);
    } catch (error) {
      console.log(error);
      handleError(error, user.wunderId, user.userName);
    }
    user.fetchUsdBalance(event.chain);
    bettingService.reFetchCompetition(
      competitionId || joiningCompetitionId,
      3000
    );
    setLoadingText(null);
    setLoading(false);
    return success;
  };

  const toggleSelectedCompetition = (
    params: SelectedCompetitionParams,
    fromCustom = false
  ) => {
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

  const handleToggle = (e: any) => {
    if (e.target.classList.contains('no-toggle')) return;
    setShowDetails(!showDetails);
    setTimeout(() => scrollIntoView(), 50);
  };

  return (
    <>
      <div className="container-white pb-16 cursor-pointer relative">
        <div ref={cardRef} className="absolute -top-12" />
        <div onClick={handleToggle}>
          <Header event={event} specialEvent={Boolean(freeRoll)} />
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
                      disabled={loading}
                      className="btn-casama py-2 px-3 text-lg no-toggle"
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
                      <EventCardPredicitionInput
                        event={event}
                        loading={loading}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                      />
                    </div>
                    <button
                      disabled={loading}
                      className="btn-casama py-2 px-3 text-lg w-full max-w-sm no-toggle"
                      onClick={() =>
                        registerBet(
                          poolRequiresBet.competitionId,
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
                      Public Betting Games
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    {freeRoll && (
                      <EventCardFreeRollTile
                        competition={freeRoll}
                        guessOne={guessOne}
                        guessTwo={guessTwo}
                        setGuessOne={setGuessOne}
                        setGuessTwo={setGuessTwo}
                        setLoading={setLoading}
                        scrollIntoView={scrollIntoView}
                        setLoadingText={setLoadingText}
                        registerBet={registerBet}
                        {...props}
                      />
                    )}
                    <div className="flex flex-row w-full gap-3 flex-wrap sm:flex-nowrap">
                      {[5, 10, 50].map((stake) => (
                        <EventCardPublicGameTile
                          key={`public-competition-${event.id}-${stake}`}
                          selectedCompetition={selectedCompetition}
                          showCustomInput={showCustomInput}
                          eventCompetitions={eventCompetitions.filter(
                            (c) => !c.sponsored
                          )}
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
                    <p className="text-xl text-casama-blue font-medium">
                      Create a private Betting Game
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row w-full gap-5 sm:gap-3 md:w-1/3">
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
            ))}
        </div>
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
