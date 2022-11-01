import { Tooltip, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import { useState, useEffect } from 'react';
import TransactionDialog from '/components/general/utils/transactionDialog';

export default function VotingButtons(props) {
  const { proposal, wunderPool, handleError } = props;
  const [userHasVoted, setUserHasVoted] = useState(proposal.hasVoted);
  const [signing, setSigning] = useState(false);

  const handleVote = (mode) => {
    setSigning(true);
    setTimeout(() => {
      wunderPool
        .vote(proposal.id, mode)
        .then((res) => {
          setUserHasVoted(mode);
          wunderPool.determineProposals();
        })
        .catch((err) => {
          handleError(err);
        })
        .then(() => {
          setSigning(false);
        });
    }, 10);
  };

  useEffect(() => {
    setUserHasVoted(proposal.hasVoted);
  }, [proposal.hasVoted]);

  if (!wunderPool.isMember) return null;

  if (proposal.executed) {
    return (
      <Tooltip title="Proposal has been Executed">
        <CheckCircleOutlineIcon fontSize="large" color="success" />
      </Tooltip>
    );
  }

  if (proposal.declined) {
    return (
      <Tooltip title="Proposal was declined">
        <BlockIcon fontSize="large" color="error" />
      </Tooltip>
    );
  }

  if (userHasVoted) {
    return userHasVoted == 1 ? (
      <button className="btn-vote-filled">You voted Yes</button>
    ) : (
      <button className="btn-vote-filled">You voted No</button>
    );
  }

  if (new Date(proposal.deadline) <= new Date()) {
    return <Typography>Voting Period has ended</Typography>;
  }

  return (
    <>
      <div className="flex flex-row justify-center mr-2">
        <button
          disabled={signing}
          className="bg-black btn-vote"
          onClick={() => handleVote(1)}
        >
          Yes
        </button>
        <button
          disabled={signing}
          className="btn-vote"
          onClick={() => handleVote(2)}
        >
          No
        </button>
      </div>
      <TransactionDialog
        open={signing}
        onClose={() => {
          setSigning(false);
        }}
      />
    </>
  );
}
