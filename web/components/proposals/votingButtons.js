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
        setUserHasVoted(res.toNumber());
      });
    }
  }, [user.address]);

  if (waitingForVote) {
    return (
      <>
        {signing && (
          <Dialog open={open} onClose={handleClose}>
            <iframe
              className="w-auto"
              id="fr"
              name="transactionFrame"
              height="500"
            ></iframe>
            <Stack spacing={2} sx={{ textAlign: 'center' }}></Stack>
          </Dialog>
        )}
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
      <Tooltip title="You voted Yes">
        <ThumbUpOutlinedIcon color="success" />
      </Tooltip>
    ) : (
      <Tooltip title="You voted No">
        <ThumbDownOutlinedIcon color="error" />
      </Tooltip>
    );
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <Tooltip title="Agree">
        <IconButton color="success" onClick={() => handleVote(1)}>
          <ThumbUpOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Disagree">
        <IconButton color="error" onClick={() => handleVote(2)}>
          <ThumbDownOutlinedIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
