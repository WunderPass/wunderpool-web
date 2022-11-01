import { Stack, Typography, Skeleton, Divider } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MakeProposalDialog from '/components/investing/dialogs/makeProposal';
import TabBar from '/components/general/utils/tabBar';
import CurrentVotingsList from '/components/investing/proposals/currentVotingsList';
import HistoryList from '/components/investing/proposals/historyList';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';

export default function ProposalList(props) {
  const { wunderPool } = props;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [openProposal, setOpenProposal] = useState(null);
  const [proposalsTab, setProposalsTab] = useState(
    router.query.proposalsTab || 0
  );
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();

  useEffect(() => {
    setProposalsTab(Number(router.query?.proposalsTab || 0));
    setOpenProposal(
      router.query?.proposal ? Number(router.query.proposal) : null
    );
  }, [router.query]);

  const handleClick = (index) => {
    if (proposalsTab == index) return;
    index === 0
      ? removeQueryParam('proposalsTab')
      : addQueryParam({ proposalsTab: index });
  };

  const handleOpenClose = (onlyClose = false) => {
    if (onlyClose && !open) return;
    if (open) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'makeFirstProposal' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.dialog == 'makeFirstProposal');
  }, [router.query]);

  return !wunderPool.loadingState.proposals ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : wunderPool.proposals.length > 0 ? (
    <Stack spacing={1} style={{ maxWidth: '100%' }}>
      <div className="flex flex-col w-full">
        <TabBar
          tabs={['Votings', 'History']}
          tab={proposalsTab}
          handleClick={handleClick}
          proposals={wunderPool.proposals}
          parent="list"
        />
        <Divider className="mb-6 mt-1 opacity-70" />
      </div>
      {proposalsTab == 0 && (
        <CurrentVotingsList openProposal={openProposal} {...props} />
      )}
      {proposalsTab == 1 && (
        <HistoryList openProposal={openProposal} {...props} />
      )}
    </Stack>
  ) : (
    <div className="container-gray border-2 mt-4">
      <Stack sx={{ textAlign: 'center' }}>
        <Typography className="mt-3" variant="h5">
          No Open Proposals
        </Typography>
        <Typography className="mb-2 mt-3" variant="subtitle1">
          Decide which tokens to invest in first by making a buy proposal below!
        </Typography>
        <button
          className="btn-casama items-center w-full mb-2 mt-6 py-3 px-3 text-lg"
          onClick={() => {
            handleOpenClose();
          }}
        >
          Make Proposal
        </button>
        <MakeProposalDialog
          open={open}
          handleOpenClose={handleOpenClose}
          {...props}
        />
      </Stack>
    </div>
  );
}
