import {
  Dialog,
  LinearProgress,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import LoupeIcon from '@mui/icons-material/Loupe';
import { fetchTransactionData, execute } from '/services/contract/proposals';
import { ethers } from 'ethers';
import { decodeParams } from '/services/formatter';
import VotingBar from '/components/proposals/votingBar';
import VotingButtons from './votingButtons';

export default function ProposalCard(props) {
  const {
    proposal,
    poolAddress,
    handleSuccess,
    handleError,
    totalGovernanceTokens,
    fetchProposals,
    fetchTokens,
    fetchBalance,
  } = props;
  const [loading, setLoading] = useState(false);
  const [waitingForExec, setWaitingForExec] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [opening, setOpen] = useState(null);
  const [signing, setSigning] = useState(false);

  const handleClose = () => {
    setSigning(false);
  };

  const handleOpen = () => {
    if (opening == proposal.id) {
      setOpen(null);
    } else {
      setOpen(proposal.id);
      setLoading(true);
      fetchTransactionData(
        poolAddress,
        proposal.id,
        proposal.transactionCount.toNumber()
      ).then((res) => {
        setLoading(false);
        setTransactionData(res);
      });
    }
  };

  const executeProposal = () => {
    setSigning(true);
    setWaitingForExec(true);
    execute(poolAddress, proposal.id)
      .then((res) => {
        console.log(res);
        handleSuccess(`Proposal "${proposal.title}" executed`);
        fetchProposals();
        fetchTokens();
        fetchBalance();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setWaitingForExec(false);
      });
  };

  return (
    <Paper elevation={1} sx={{ overflowY: 'hidden' }}>
      <Box p={2}>
        <Stack
          className="flex flex-row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center">
              <Typography variant="h6">{proposal.title}</Typography>
              <Tooltip title="Show details">
                <IconButton color="info" onClick={handleOpen}>
                  <LoupeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="subtitle1">{proposal.description}</Typography>
          </Stack>
          <div className="flex flex-col md:flex-row h-32 md:h-10 ml-4 md:ml-0">
            {!proposal.executed && (
              <button
                className="p-8 btn btn-warning"
                disabled={waitingForExec}
                onClick={executeProposal}
              >
                Execute
              </button>
            )}
            {signing && (
              <>
                <Dialog open={open} onClose={handleClose}>
                  <iframe
                    className="w-auto"
                    id="fr"
                    name="transactionFrame"
                    height="600"
                  ></iframe>
                  <Stack spacing={2} sx={{ textAlign: 'center' }}>
                    <LinearProgress />
                  </Stack>
                </Dialog>
              </>
            )}
            <div className="md:pl-4 pl-0 md:pt-1 pt-8 self-center ">
              <div className="">
                <VotingButtons {...props} />
              </div>
            </div>
          </div>
        </Stack>
        <Collapse in={opening == proposal.id}>
          <Stack spacing={1}>
            <Divider />
            <Typography
              variant="subtitle1"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="span" fontStyle="italic">
                Zustimmungen
              </Typography>
              {proposal.yesVotes.toString()} /{' '}
              {totalGovernanceTokens?.toString()} Stimmen
            </Typography>
            <Divider />
            <Typography
              variant="subtitle1"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="span" fontStyle="italic">
                Ablehnungen
              </Typography>
              {proposal.noVotes.toString()} /{' '}
              {totalGovernanceTokens?.toString()} Stimmen
            </Typography>
            <Divider />
            <Typography
              variant="subtitle1"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="span" fontStyle="italic">
                Deadline
              </Typography>
              {new Date(proposal.deadline.mul(1000).toNumber()).toLocaleString(
                'de'
              )}
            </Typography>
            <Divider />
            <Typography
              variant="subtitle1"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="span" fontStyle="italic">
                Created At
              </Typography>
              {new Date(proposal.createdAt.mul(1000).toNumber()).toLocaleString(
                'de'
              )}
            </Typography>

            {loading ? (
              <Skeleton
                variant="rectangular"
                width="100%"
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <>
                {transactionData &&
                  transactionData.map((data, i) => {
                    return (
                      <Box key={`proposal-${proposal.id}-${i}`} pt={2}>
                        <Typography variant="h6">Transaction #{i}</Typography>
                        <Divider />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="span" fontStyle="italic">
                            Contract
                          </Typography>
                          {data.contractAddress}
                        </Typography>
                        <Divider />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="span" fontStyle="italic">
                            Action
                          </Typography>
                          {data.action}
                        </Typography>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="subtitle1" fontStyle="italic">
                            Params
                          </Typography>
                          <Stack alignItems="end">
                            {decodeParams(data.action, data.params).map(
                              (param, j) => {
                                const formattedParam =
                                  typeof param == 'string'
                                    ? param
                                    : param?.toString() || null;
                                return (
                                  <Typography
                                    key={`param-${i}-${j}`}
                                    variant="subtitle1"
                                  >
                                    {formattedParam || JSON.stringify(param)}
                                  </Typography>
                                );
                              }
                            )}
                          </Stack>
                        </Stack>
                        <Divider />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="span" fontStyle="italic">
                            Value
                          </Typography>
                          {ethers.utils.formatUnits(data.transactionValue)}{' '}
                          MATIC
                        </Typography>
                      </Box>
                    );
                  })}
              </>
            )}
            {proposal.execute && (
              <Dialog open={open} onClose={handleClose}>
                <iframe
                  className="w-auto"
                  id="fr"
                  name="transactionFrame"
                  height="600"
                ></iframe>
                <Stack spacing={2} sx={{ textAlign: 'center' }}>
                  <LinearProgress />
                </Stack>
              </Dialog>
            )}
          </Stack>
        </Collapse>
      </Box>
      <VotingBar
        yes={proposal.yesVotes.toNumber()}
        no={proposal.noVotes.toNumber()}
        total={totalGovernanceTokens?.toNumber()}
      />
    </Paper>
  );
}
