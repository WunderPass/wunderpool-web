import { Box, Button, CircularProgress, Collapse, Divider, IconButton, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LoupeIcon from '@mui/icons-material/Loupe';
import { fetchTransactionData, execute } from '/services/contract/proposals';
import { ethers } from 'ethers';
import { decodeParams } from '/services/formatter';
import { vote } from '/services/contract/vote';
import VotingBar from "/components/proposals/votingBar";

export default function ProposalCard(props) {
  const {proposal, poolAddress, handleSuccess, handleError, members, fetchProposals} = props;
  const [loading, setLoading] = useState(false);
  const [waitingForVote, setWaitingForVote] = useState(false);
  const [waitingForExec, setWaitingForExec] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [open, setOpen] = useState(null);

  const handleOpen = () => {
    if(open == proposal.id) {
      setOpen(null);
    } else {
      setOpen(proposal.id);
      setLoading(true);
      fetchTransactionData(poolAddress, proposal.id, proposal.transactionCount.toNumber()).then((res) => {
        setLoading(false);
        setTransactionData(res);
      })
    }
  }

  const handleVote = (mode) => {
    setWaitingForVote(true);
    vote(poolAddress, proposal.id, mode).then((res) => {
      handleSuccess(`Voted ${mode == 0 ? 'YES' : 'NO'} for Proposal "${proposal.title}"`);
      fetchProposals();
      console.log(res);
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setWaitingForVote(false);
    })
  }

  const executeProposal = () => {
    setWaitingForExec(true);
    execute(poolAddress, proposal.id).then((res) => {
      console.log(res);
      handleSuccess(`Proposal "${proposal.title}" executed`);
      fetchProposals();
    }).catch((err) => {
      handleError(err);
    }).then(() => {
      setWaitingForExec(false);
    })
  }

  return (
    <Paper elevation={3} sx={{overflowY: 'hidden'}}>
      <Box p={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
              <Typography variant="h6">{proposal.title}</Typography>
              <IconButton color="info" onClick={handleOpen}><LoupeIcon /></IconButton>
            </Stack>
            <Typography variant="subtitle1">{proposal.description}</Typography>
          </Stack>
          {waitingForVote ? 
            <CircularProgress /> :
            proposal.executed ?
            <CheckCircleOutlineIcon fontSize="large" color="success" /> :
            <Stack direction="row" alignItems="center" justifyContent="center">
              <IconButton color="success" onClick={() => handleVote(0)}><ThumbUpOutlinedIcon /></IconButton>
              <IconButton color="error" onClick={() => handleVote(1)}><ThumbDownOutlinedIcon /></IconButton>
            </Stack>
          }
        </Stack>
        <Collapse in={open == proposal.id}>
          <Stack spacing={1}>
            <Divider />
            <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Zustimmungen</Typography>{proposal.yesVotes.toNumber()} / {members.length} Stimmen</Typography>
            <Divider />
            <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Ablehnungen</Typography>{proposal.noVotes.toNumber()} / {members.length} Stimmen</Typography>
            <Divider />
            <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Enthaltungen</Typography>{proposal.abstainVotes.toNumber()} / {members.length} Stimmen</Typography>
            <Divider />
            <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Deadline</Typography>{new Date(proposal.deadline.toNumber() * 1000).toLocaleString('de')}</Typography>
            <Divider />
            <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Created At</Typography>{new Date(proposal.createdAt.toNumber() * 1000).toLocaleString('de')}</Typography>
            {loading ?
              <Skeleton variant="rectangular" width="100%" sx={{borderRadius: 3}} /> :
              <>
                {transactionData && transactionData.map((data, i) => {
                  return (
                    <Box key={`proposal-${proposal.id}-${i}`} pt={2}>
                      <Typography variant="h6">Transaction #{i}</Typography>
                      <Divider />
                      <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Contract</Typography>{data.contractAddress}</Typography>
                      <Divider />
                      <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Action</Typography>{data.action}</Typography>
                      <Divider />
                      <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Params</Typography>{JSON.stringify(decodeParams(data.action, data.params))}</Typography>
                      <Divider />
                      <Typography variant="subtitle1" sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="span" fontStyle="italic">Value</Typography>{ethers.utils.formatUnits(data.transactionValue)} MATIC</Typography>
                    </Box>
                  )
                })}
              </>
            }
            {proposal.executed == false && <Button disabled={waitingForExec} onClick={executeProposal}>Execute</Button>}
          </Stack>
        </Collapse>
      </Box>
      <VotingBar yes={proposal.yesVotes.toNumber()} no={proposal.noVotes.toNumber()} total={members.length} />
    </Paper>
  )
}
