import { Typography, IconButton, Divider, Collapse, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '/services/formatter';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';
import Timer from '/components/general/utils/timer';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import axios from 'axios';
import { calculateWinnings } from '/services/bettingHelpers';
import { addToWhiteListWithSecret } from '../../../services/contract/pools';
import TransactionDialog from '../../general/utils/transactionDialog';
import ParticipantTable, {
  ParticipantTableRow,
} from '../games/ParticipantTable';
import { compAddr, getNameFor } from '../../../services/memberHelpers';
import { IoIosArrowDown } from 'react-icons/io';
import { useRef } from 'react';
import DashboardCompetitionCard from '/components/betting/dashboard/competitionCard';

export default function BetsRow(props) {
  const { competition, handleSuccess, user, isHistory, isSortById, rows } =
    props;
  const [showDetails, setShowDetails] = useState(false);
  const scrollToRef = useRef(null);

  return (
    <div className="flex flex-row">
      <DashboardCompetitionCard
        key={`dashboard-competition-card-${competition.id}`}
        competition={competition}
        user={user}
        isSortById={isSortById}
        isHistory={isHistory}
        {...props}
      />
    </div>
  );
}
