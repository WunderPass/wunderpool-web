import { CircularProgress, IconButton, Stack } from "@mui/material"
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState, useEffect } from "react";
import { vote } from '/services/contract/vote';
import { hasVoted } from "/services/contract/vote";

export default function VotingButtons(props) {
  const {proposal, user, poolAddress, fetchProposals, handleSuccess, handleError} = props;
  const [waitingForVote, setWaitingForVote] = useState(true);
  const [userHasVoted, setUserHasVoted] = useState(null);

  const handleVote = (mode) => {
    setWaitingForVote(true);
    vote(poolAddress, proposal.id, mode).then((res) => {
      handleSuccess(`Voted ${mode == 1 ? 'YES' : 'NO'} for Proposal "${proposal.title}"`);
      setUserHasVoted(mode);
      fetchProposals();
      console.log(res);
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setWaitingForVote(false);
    })
  }

  useEffect(() => {
    if (user.address) {
      hasVoted(poolAddress, proposal.id, user.address).then(res => {
        setWaitingForVote(false);
        setUserHasVoted(res.toNumber());
      })
    }
  }, [user.address])

  if (waitingForVote) {
    return <CircularProgress />
  }

  if (proposal.executed) {
    return <CheckCircleOutlineIcon fontSize="large" color="success" />
  }

  if (userHasVoted) {
    return (
      userHasVoted == 1 ? <ThumbUpOutlinedIcon color="success"/> : <ThumbDownOutlinedIcon color="error"/>
    )
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <IconButton color="success" onClick={() => handleVote(1)}><ThumbUpOutlinedIcon /></IconButton>
      <IconButton color="error" onClick={() => handleVote(2)}><ThumbDownOutlinedIcon /></IconButton>
    </Stack>
  )
}