import {
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import { useMemo, useState } from 'react';
import LoupeIcon from '@mui/icons-material/Loupe';
import { ethers } from 'ethers';
import { decodeParams } from '/services/formatter';
import VotingResults from '/components/investing/proposals/votingResults';
import VotingButtons from './votingButtons';
import Timer from '/components/investing/proposals/timer';
import TransactionDialog from '/components/general/utils/transactionDialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import ResponsiveDialog from '/components/general/utils/responsiveDialog';

function OpenProposalDialog(props) {
  const {
    open,
    handleOpen,
    proposal,
    signing,
    executeProposal,
    yesVotes,
    noVotes,
    totalVotes,
    loading,
    transactionData,
    handleSuccess,
  } = props;

  return (
    <ResponsiveDialog
      maxWidth="sm"
      open={open}
      onClose={handleOpen}
      contentClass="bg-gray-200 p-5"
      title={proposal.title}
      actionButtons={
        <IconButton
          onClick={() =>
            handleShare(
              location.href,
              `Look at this Proposal: ${proposal.title} || ${proposal.description}`,
              handleSuccess
            )
          }
        >
          <ShareIcon className="text-casama-blue" />
        </IconButton>
      }
    >
      <Typography className="font-light text-sm opacity-50 mt-4 text-ellipsis overflow-hidden">
        {proposal.description}
      </Typography>

      <div className="mt-4 mb-8">
        {!proposal.executed && !proposal.declined && (
          <Timer
            start={proposal.createdAt}
            end={proposal.deadline}
            text="Days Left to Vote"
            bar
          />
        )}
      </div>

      <VotingResults yes={yesVotes} no={noVotes} total={totalVotes} />
      <div className="flex flex-row justify-center items-center">
        <VotingButtons {...props} />
        <div>
          <button
            className={
              proposal.executable ? 'p-8 btn btn-warning ml-2' : 'hidden'
            }
            disabled={signing}
            onClick={executeProposal}
          >
            Execute
          </button>
        </div>
      </div>
      <Stack spacing={1} mt={2}>
        <Divider />
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography variant="span" fontStyle="italic">
            Yes
          </Typography>
          {yesVotes} / {totalVotes} Votes
        </Typography>
        <Divider />
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography variant="span" fontStyle="italic">
            No
          </Typography>
          {noVotes} / {totalVotes} Votes
        </Typography>
        <Divider />
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography variant="span" fontStyle="italic">
            Deadline
          </Typography>
          {new Date(proposal.deadline).toLocaleString('de')}
        </Typography>
        <Divider />
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography variant="span" fontStyle="italic">
            Created At
          </Typography>
          {new Date(proposal.createdAt).toLocaleString('de')}
        </Typography>

        {/* {loading ? (
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
          )} */}
      </Stack>
    </ResponsiveDialog>
  );
}

function ClosedProposal(props) {
  const {
    proposal,
    handleOpen,
    signing,
    executeProposal,
    wunderPool,
    yesVotes,
    noVotes,
    totalVotes,
  } = props;

  return (
    <div className="container-gray mb-6">
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
        {!proposal.executed && !proposal.declined && (
          <Timer
            start={proposal.createdAt}
            end={proposal.deadline}
            text="Days Left to Vote"
            bar
          />
        )}
      </div>

      <VotingResults yes={yesVotes} no={noVotes} total={totalVotes} />
      <div className="flex flex-row justify-center items-center">
        <VotingButtons {...props} />
        <div>
          <button
            className={
              proposal.executable ? 'p-8 btn btn-warning ml-2' : 'hidden'
            }
            disabled={signing}
            onClick={executeProposal}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProposalCard(props) {
  const {
    proposal,
    wunderPool,
    user,
    openProposal,
    handleSuccess,
    handleError,
  } = props;
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [signing, setSigning] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();

  const { yesVotes = 0, noVotes = 0, totalVotes } = proposal;

  const handleClose = () => {
    setSigning(false);
    setLoading(false);
  };

  const handleOpen = () => {
    if (openProposal === proposal.id) {
      goBack(() => removeQueryParam('proposal'));
    } else {
      addQueryParam({ proposal: proposal.id }, false);
      // setLoading(true);
      // wunderPool
      //   .getTransactionData(proposal.id, proposal.transactionCount.toNumber())
      //   .then((res) => {
      //     setLoading(false);
      //     setTransactionData(res);
      //   });
    }
  };

  const executeProposal = () => {
    setSigning(true);
    setTimeout(() => {
      wunderPool
        .execute(proposal.id)
        .then((res) => {
          handleClose(false);
          if (res) {
            handleSuccess('Pool closed');
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
    }, 10);
  };

  return (
    <>
      <ClosedProposal
        handleOpen={handleOpen}
        signing={signing}
        executeProposal={executeProposal}
        yesVotes={yesVotes}
        noVotes={noVotes}
        totalVotes={totalVotes}
        {...props}
      />
      <OpenProposalDialog
        open={openProposal === proposal.id}
        handleOpen={handleOpen}
        signing={signing}
        executeProposal={executeProposal}
        loading={loading}
        transactionData={transactionData}
        yesVotes={yesVotes}
        noVotes={noVotes}
        totalVotes={totalVotes}
        {...props}
      />
      <TransactionDialog open={signing} onClose={handleClose}>
        {!wunderPool.closed && (
          <Alert
            severity="warning"
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            After execution, no new members can join this Pool
          </Alert>
        )}
      </TransactionDialog>
    </>
  );
}
