import {
  Dialog,
  LinearProgress,
  Box,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useState, useEffect } from 'react';
import LoupeIcon from '@mui/icons-material/Loupe';
import { ethers } from 'ethers';
import { decodeParams } from '/services/formatter';
import VotingBar from '/components/proposals/votingBar';
import VotingButtons from './votingButtons';

export default function ProposalCard(props) {
  const { proposal, wunderPool, user, handleSuccess, handleError } = props;
  const { totalSupply } = wunderPool.governanceToken;
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [opening, setOpen] = useState(null);
  const [signing, setSigning] = useState(false);
  const [executable, setExecutable] = useState(false);
  const [closeable, setCloseable] = useState(false);

  useEffect(() => {
    setExecutable(proposal.yesVotes.toNumber() > totalSupply?.toNumber() / 2);
    setCloseable(
      executable || proposal.noVotes.toNumber() > totalSupply?.toNumber() / 2
    );
  });

  const handleClose = () => {
    setSigning(false);
  };

  const handleOpen = () => {
    if (opening == proposal.id) {
      setOpen(null);
    } else {
      setOpen(proposal.id);
      setLoading(true);
      wunderPool
        .getTransactionData(proposal.id, proposal.transactionCount.toNumber())
        .then((res) => {
          setLoading(false);
          setTransactionData(res);
        });
    }
  };

  const executeProposal = () => {
    setSigning(true);
    wunderPool
      .execute(proposal.id)
      .then((res) => {
        if (res) {
          handleSuccess('Pool liquidated');
          user.fetchUsdBalance();
        } else {
          handleSuccess(`Proposal "${proposal.title}" executed`);
          wunderPool.determineProposals();
          wunderPool.determineTokens();
          wunderPool.determineBalance();
        }
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setSigning(false);
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
                className={executable ? 'p-8 btn btn-warning' : 'hidden'}
                disabled={signing}
                onClick={executeProposal}
              >
                Execute
              </button>
            )}
            <>
              <Dialog
                open={signing}
                onClose={handleClose}
                PaperProps={{
                  style: { borderRadius: 12 },
                }}
              >
                {!wunderPool.closed && (
                  <Alert severity="warning">
                    <AlertTitle>
                      After execution, no new members can join this Pool
                    </AlertTitle>
                  </Alert>
                )}
                <iframe
                  className="w-auto"
                  id="fr"
                  name="transactionFrame"
                  height="500"
                ></iframe>
                <Stack spacing={2} sx={{ textAlign: 'center' }}></Stack>
              </Dialog>
            </>
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
              {proposal.yesVotes.toString()} / {totalSupply?.toString()} Stimmen
            </Typography>
            <Divider />
            <Typography
              variant="subtitle1"
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="span" fontStyle="italic">
                Ablehnungen
              </Typography>
              {proposal.noVotes.toString()} / {totalSupply?.toString()} Stimmen
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
          </Stack>
        </Collapse>
      </Box>
      <VotingBar
        yes={proposal.yesVotes.toNumber()}
        no={proposal.noVotes.toNumber()}
        total={totalSupply?.toNumber()}
      />
    </Paper>
  );
}
