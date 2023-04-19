import { Collapse, Divider } from '@mui/material';
import { useState } from 'react';
import TransactionFrame from '../../../general/utils/transactionFrame';
import { joinSingleCompetition } from '../../../../services/contract/betting/competitions';
import Body from './body';
import Header from './header';
import MagicMomentMultiDialog from './magicMomentMultiDialog';
import {
  MultiBetFormat,
  registerParticipantForMulti,
} from '../../../../services/contract/betting/games';
import { useMemo } from 'react';
import MultiCardSubmitButton from './submitButton';
import { UseBettingService } from '../../../../hooks/useBettingService';
import { UseUserType } from '../../../../hooks/useUser';
import { UseNotification } from '../../../../hooks/useNotification';
import { FormattedCompetition } from '../../../../services/bettingHelpers';

type MultiCardProps = {
  bettingService: UseBettingService;
  user: UseUserType;
  handleError: UseNotification.handleError;
  competition: FormattedCompetition;
};

export default function MultiCard(props: MultiCardProps) {
  const { bettingService, user, handleError, competition } = props;
  const [loading, setLoading] = useState<boolean>(null);
  const [loadingText, setLoadingText] = useState<string>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [joiningCompetitionId, setJoiningCompetitionId] =
    useState<number>(null);
  const [joiningBlockchainId, setJoiningBlockchainId] = useState<number>(null);
  const [joiningGameIds, setJoiningGameIds] = useState<number[]>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [bets, setBets] = useState<MultiBetFormat[]>([]);

  const mustClickAgain = useMemo(
    () => joiningCompetitionId && joiningGameIds,
    [joiningCompetitionId, joiningGameIds]
  );

  const placeBet = async () => {
    const gameIds = competition.games
      .filter(({ state }) => state === 'UPCOMING')
      .map(({ id }) => id);

    await joinPublicCompetition();

    if (competition.competitionId) {
      if (user.loginMethod == 'Casama') {
        await registerBet(
          competition.competitionId,
          competition.blockchainId,
          gameIds
        );
      } else {
        setJoiningCompetitionId(competition.competitionId);
        setJoiningBlockchainId(competition.blockchainId);
        setJoiningGameIds(gameIds);
      }
    } else {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(null);
    setLoadingText(null);
    setShowDetails(false);
    setBets([]);
    setJoiningCompetitionId(null);
    setJoiningBlockchainId(null);
    setJoiningGameIds(null);
    window.location.reload(); //TODO FIX THIS IN THE FUTURE (BUG after voting all mutli games are displayed as the same game)
  };

  const joinPublicCompetition = async () => {
    setLoading(true);
    setLoadingText('Joining Public Competition...');

    try {
      await joinSingleCompetition({
        userAddress: user.address,
        stake: competition.stake,
        poolAddress: competition.poolAddress,
        poolVersion: 'ETA',
        chain: competition.games[0].event.chain,
      });
      return {
        competitionId: competition.competitionId,
        blockchainId: competition.blockchainId,
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

  const registerBet = async (
    competitionId: number,
    blockchainId: number,
    gameIds: number[]
  ) => {
    setLoading(true);
    setLoadingText('Placing your Bet...');
    let success = false;
    try {
      await registerParticipantForMulti(
        competitionId || joiningCompetitionId,
        blockchainId,
        gameIds || joiningGameIds,
        user.address,
        competition.games[0].event.version,
        bets,
        competition.games[0].event.chain
      );

      success = true;
      setShowSuccess(true);
    } catch (error) {
      console.log(error);
      handleError(error, user.wunderId, user.userName);
    }
    user.fetchUsdBalance(competition.games[0].event.chain);
    bettingService.reFetchCompetition(
      competitionId || joiningCompetitionId,
      3000
    );
    setLoadingText(null);
    setLoading(false);
    return success;
  };

  const handleToggle = (e: any) => {
    if (e.target.classList.contains('no-toggle')) return;
    setShowDetails(!showDetails);
  };

  return (
    <>
      {competition.games.length > 1 && (
        <div className="container-white pb-16 cursor-pointer relative">
          <div>
            <div onClick={(e) => handleToggle(e)}>
              <Header competition={competition} user={user} />
            </div>
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
                        className="btn-casama py-2 px-3 text-lg"
                        onClick={() =>
                          registerBet(
                            joiningCompetitionId,
                            joiningBlockchainId,
                            joiningGameIds
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
                    user={user}
                    competition={competition}
                    bets={bets}
                    setBets={setBets}
                  />
                  <div className="flex flex-col justify-center items-center w-full">
                    <div className="flex items-center justify-center mb-5 w-full">
                      <div className="flex justify-center items-center text-semibold sm:text-lg"></div>

                      <div className="flex justify-center items-center sm:w-1/2 w-full">
                        <MultiCardSubmitButton
                          disabled={
                            bets.length != competition.games.length ||
                            bets.some(
                              ({ home_score, guest_score }) =>
                                home_score == undefined ||
                                guest_score == undefined
                            )
                          }
                          user={user}
                          loading={loading}
                          placeBet={placeBet}
                          competition={competition}
                        />
                      </div>
                      <Divider className="mt-6" />
                    </div>
                  </div>
                </Collapse>
              ))}
          </div>
        </div>
      )}
      <MagicMomentMultiDialog
        open={showSuccess}
        setOpen={setShowSuccess}
        reset={reset}
        competition={competition}
      />
    </>
  );
}
