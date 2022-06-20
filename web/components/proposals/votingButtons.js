import {
  CircularProgress,
  IconButton,
  Stack,
  Dialog,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState, useEffect } from 'react';

export default function VotingButtons(props) {
  const {
    proposal,
    user,
    poolAddress,
    wunderPool,
    handleSuccess,
    handleError,
  } = props;
  const [waitingForVote, setWaitingForVote] = useState(false);
  const [userHasVoted, setUserHasVoted] = useState(null);
  const [signing, setSigning] = useState(false);

  const handleClose = () => {
    setSigning(false);
    setWaitingForVote(false);
  };

  const handleVote = (mode) => {
    setWaitingForVote(true);
    setSigning(true);
    wunderPool
      .vote(proposal.id, mode)
      .then((res) => {
        handleSuccess(
          `Voted ${mode == 1 ? 'YES' : 'NO'} for Proposal "${proposal.title}"`
        );
        setUserHasVoted(mode);
        wunderPool.determineProposals();
        console.log(res);
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setWaitingForVote(false);
      });
  };

  useEffect(() => {
    if (user.address) {
      wunderPool.userHasVoted(proposal.id).then((res) => {
        setWaitingForVote(false);
        setUserHasVoted(res);
      });
    }
  }, [user.address]);

  if (waitingForVote) {
    return (
      <>
        <Dialog
          open={signing}
          onClose={handleClose}
          PaperProps={{
            style: { borderRadius: 12 },
          }}
        >
          <iframe
            className="w-auto"
            id="fr"
            name="transactionFrame"
            height="500"
          ></iframe>
          <Stack spacing={2} sx={{ textAlign: 'center' }}></Stack>
        </Dialog>
        <CircularProgress />
      </>
    );
  }

  if (proposal.executed) {
    return (
      <Tooltip title="Proposal has been Executed">
        <CheckCircleOutlineIcon fontSize="large" color="success" />
      </Tooltip>
    );
  }

  if (userHasVoted) {
    return userHasVoted == 1 ? (
      <>
        <button className="btn-vote-filled">Yes</button>
      </>
    ) : (
      <>
        <button className="btn-vote-filled">No</button>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-center mt-2">
        <button className="bg-black btn-vote" onClick={() => handleVote(1)}>
          Yes
        </button>
        <button className="btn-vote" onClick={() => handleVote(2)}>
          No
        </button>
      </div>
    </>
  );
}
