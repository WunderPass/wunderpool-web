import { Stack, Typography, Skeleton, Divider } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ProposalCard from './proposalCard';
import MakeProposalDialog from '/components/dialogs/makeProposal';
import TabBar from '/components/utils/tabBar';
import CurrentVotingsList from '/components/proposals/currentVotingsList';
import HistoryList from '/components/proposals/historyList';
import ExecutableList from '/components/proposals/executableList';

export default function ProposalList(props) {
  const { wunderPool } = props;
  const [open, setOpen] = useState(false);
  const [openProposal, setOpenProposal] = useState(null);
  const router = useRouter();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.proposal) setOpenProposal(Number(router.query.proposal));
  }, [router.isReady]);

  return !wunderPool.isReady2 ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : wunderPool.proposals.length > 0 ? (
    <Stack spacing={1} style={{ maxWidth: '100%' }}>
      <div className="flex flex-col w-full">
        <TabBar
          tabs={['Current Votings', 'Executable', 'History']}
          tab={tab}
          setTab={setTab}
        />
        <Divider className="mb-6 mt-1 opacity-70" />
      </div>
      {tab == 0 && (
        <CurrentVotingsList
          wunderPool={wunderPool}
          openProposal={openProposal}
          setOpenProposal={setOpenProposal}
          {...props}
        />
      )}

      {tab == 1 && (
        <ExecutableList
          wunderPool={wunderPool}
          openProposal={openProposal}
          setOpenProposal={setOpenProposal}
          {...props}
        />
      )}

      {tab == 2 && (
        <HistoryList
          wunderPool={wunderPool}
          openProposal={openProposal}
          setOpenProposal={setOpenProposal}
          {...props}
        />
      )}
    </Stack>
  ) : (
    <div className="container-gray border-2">
      <Stack sx={{ textAlign: 'center' }}>
        <Typography className="mt-3" variant="h5">
          There are no Proposals
        </Typography>
        <Typography className="mb-2 mt-3" variant="subtitle1">
          Create one now!
        </Typography>
        <button
          className="btn-kaico items-center w-full mb-2 mt-6 py-3 px-3 text-lg"
          onClick={() => {
            setOpen(true);
          }}
        >
          Make Proposal
        </button>
        <MakeProposalDialog open={open} setOpen={setOpen} {...props} />
      </Stack>
    </div>
  );
}
