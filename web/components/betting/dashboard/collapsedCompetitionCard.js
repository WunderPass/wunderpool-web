import { Typography, IconButton, Divider, Collapse, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '/services/formatter';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';
import Timer from '/components/general/utils/timer';
import SoccerTimer from '/components/general/utils/soccerTimer';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import axios from 'axios';
import { calculateWinnings } from '/services/bettingHelpers';
import { addToWhiteListWithSecret } from '../../../services/contract/pools';
import TransactionDialog from '../../general/utils/transactionDialog';
import ParticipantTable, {
  CollapsedParticipantTableRow,
} from '../games/ParticipantTable';
import { compAddr, getNameFor } from '../../../services/memberHelpers';
import { IoIosArrowDown } from 'react-icons/io';
import { BiExpand } from 'react-icons/bi';
import { useRef } from 'react';

export default function DashboardCompetitionCard(props) {
  const {
    competition,
    handleSuccess,
    handleError,
    user,
    isSortById,
    isHistory,
    toggleCollapse,
  } = props;
  const [showDetails, setShowDetails] = useState(false);
  const [liveCompetition, setLiveCompetition] = useState(null);
  const [gameResultTable, setGameResultTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollToRef = useRef(null);

  const { stake, sponsored, payoutRule, isPublic, maxMembers } =
    competition || {};

  const game = (liveCompetition || competition).games[0]; //TODO Only assume Single Competitions as of now

  useEffect(() => {
    if (['RESOLVED', 'CLOSED_FOR_BETTING'].includes(game.event.state)) {
      setGameResultTable(
        calculateWinnings(
          game,
          sponsored ? stake / maxMembers : stake,
          game.event.outcome,
          payoutRule,
          sponsored
        )
      );
    } else {
      setGameResultTable(game.participants);
    }
  }, [game.event?.outcome]);

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  const handleToggle = (e) => {
    if (e.target.getAttribute('togglable') == 'false') return;
    setShowDetails(!showDetails);
    scrollToRef.current.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="container-gray w-full cursor-pointer relative h-full">
        <div ref={scrollToRef} className="absolute -top-16" />
        <div className="flex h-full" onClick={toggleCollapse}>
          <div className="flex flex-col h-full justify-between items-between gap-2 w-full">
            <div className="flex flex-row w-full mb-4">
              <div className="flex flex-col items-end gap-3">
                <Chip
                  className={`${
                    sponsored ? 'bg-gold-shiny' : 'bg-white text-casama-blue'
                  } w-full`}
                  size="medium"
                  label={
                    sponsored ? 'Free Roll' : isPublic ? 'Public' : 'Private'
                  }
                />
                <Chip
                  className="bg-casama-blue text-white w-full"
                  size="medium"
                  label={currency(
                    sponsored
                      ? (stake / (maxMembers - 1)) * game.participants.length
                      : stake
                  )}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center items-center w-full"></div>
            <div className="flex flex-col w-full">
              <Collapse in={!showDetails}>
                <CollapsedParticipantTableRow
                  user={user}
                  address={'Your Bet'}
                  wunderId={user.wunderId}
                  userName={user.userName}
                  profileName={getNameFor(user)}
                  prediction={
                    gameResultTable.find((p) =>
                      compAddr(p.address, user.address)
                    )?.prediction
                  }
                  winnings={
                    gameResultTable.find((p) =>
                      compAddr(p.address, user.address)
                    )?.winnings
                  }
                  stake={sponsored ? 0 : stake}
                />
              </Collapse>

              <div className="flex justify-center text-3xl text-casama-blue">
                <div className={`transition-transform `}>
                  <BiExpand className="text-3xl text-casama-blue" />
                </div>
              </div>
              <TransactionDialog
                open={loading}
                onClose={() => setLoading(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
