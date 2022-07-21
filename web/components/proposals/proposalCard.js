import {
  Dialog,
  Box,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useState } from 'react';
import LoupeIcon from '@mui/icons-material/Loupe';
import { ethers } from 'ethers';
import { decodeParams } from '/services/formatter';
import VotingResults from '/components/proposals/votingResults';

import VotingButtons from './votingButtons';
import Timer from '/components/proposals/timer';

export default function ProposalCard(props) {
  const {
    proposal,
    wunderPool,
    user,
    openProposal,
    setOpenProposal,
    handleSuccess,
    handleError,
  } = props;
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [signing, setSigning] = useState(false);

  const handleClose = () => {
    setSigning(false);
    setLoading(false);
  };

  const handleOpen = () => {
    if (openProposal === proposal.id) {
      setOpenProposal(null);
    } else {
      setOpenProposal(proposal.id);
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
        console.log(res);
        handleClose(false);
        if (res) {
          handleSuccess('Pool liquidated');
          user.fetchUsdBalance();
          user.fetchPools();
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
    <div
      className="container-gray mb-6"
      style={{
        gridColumn: openProposal === proposal.id ? '1 / 3' : '',
      }}
    >
      <div className="flex flex-row items-center">
        <Typography className="text-xl ">{proposal.title}</Typography>
        <Tooltip title="Show details">
          <IconButton color="info" onClick={handleOpen}>
            <LoupeIcon />
          </IconButton>
        </Tooltip>
      </div>

      <Typography className="font-light text-sm opacity-50 mt-4  text-ellipsis  overflow-hidden">
        {proposal.description}
      </Typography>

      <div className="mt-4 mb-8 ">
        {!proposal.executed && !proposal.declined && <Timer {...props} />}
      </div>

      <VotingResults
        yes={proposal.yesVotes.toNumber()}
        no={proposal.noVotes.toNumber()}
        total={proposal.totalVotes.toNumber()}
      />
      <div className="flex flex-row justify-center">
        <VotingButtons {...props} />
        <div>
          <button
            className={proposal.executable ? 'p-8 btn btn-warning ' : 'hidden'}
            disabled={signing}
            onClick={executeProposal}
          >
            Execute
          </button>
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
        </div>
      </div>
      <Collapse className="mt-2" in={openProposal === proposal.id}>
        <Stack spacing={1}>
          <Divider />
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Typography variant="span" fontStyle="italic">
              Zustimmungen
            </Typography>
            {proposal.yesVotes.toString()} / {proposal.totalVotes.toString()}{' '}
            Stimmen
          </Typography>
          <Divider />
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Typography variant="span" fontStyle="italic">
              Ablehnungen
            </Typography>
            {proposal.noVotes.toString()} / {proposal.totalVotes.toString()}{' '}
            Stimmen
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
                        <Typography className="ml-2 truncate ">
                          {data.contractAddress}
                        </Typography>
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
                        <Typography className=" ml-2 truncate ">
                          {data.action}
                        </Typography>
                      </Typography>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle1" fontStyle="italic">
                          Params
                        </Typography>
                        <Stack className="ml-2 truncate" alignItems="start">
                          {decodeParams(data.action, data.params).map(
                            (param, j) => {
                              const formattedParam =
                                typeof param == 'string'
                                  ? param
                                  : param?.toString() || null;
                              return (
                                <Typography
                                  key={`param-${i}-${j}`}
                                  variant="span"
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
                        {ethers.utils.formatUnits(data.transactionValue)} MATIC
                      </Typography>
                    </Box>
                  );
                })}
            </>
          )}
        </Stack>
      </Collapse>
    </div>
  );
}
