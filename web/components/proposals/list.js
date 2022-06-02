import {
  Box,
  Paper,
  Slide,
  Stack,
  Tab,
  Tabs,
  Typography,
  Skeleton,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import ProposalCard from './proposalCard';

export default function ProposalList(props) {
  const { wunderPool, setApe } = props;
  const [tab, setTab] = useState(0);
  const slidingContainer = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (wunderPool.isReady2) {
      console.log(wunderPool.isReady);
      console.log(wunderPool.proposals);
      setIsLoading(false);
    }
  }, [wunderPool.isReady2]);

  return isLoading ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : wunderPool.proposals.length != 0 ? (
    <Stack spacing={1} style={{ maxWidth: '100%' }}>
      <Tabs value={tab} onChange={(_, val) => setTab(val)}>
        <Tab label="Open" sx={{ maxWidth: 'unset' }} className="flex-1" />
        <Tab
          label="Closed"
          sx={{ maxWidth: 'unset' }}
          className="flex-1 pr-6"
        />
      </Tabs>
      <Box ref={slidingContainer} p={1} overflow="hidden" className="w-full">
        {tab == 0 && (
          <Slide
            container={slidingContainer.current}
            direction="right"
            in={tab == 0}
          >
            <Stack spacing={2}>
              {wunderPool.proposals
                .filter((p) => p.executed == false)
                .sort((one, two) => two.createdAt.sub(one.createdAt))
                .map((proposal) => {
                  return (
                    <ProposalCard
                      key={`proposal-${proposal.id}`}
                      proposal={proposal}
                      {...props}
                    />
                  );
                })}
            </Stack>
          </Slide>
        )}
        {tab == 1 && (
          <Slide
            container={slidingContainer.current}
            direction="left"
            in={tab == 1}
          >
            <Stack spacing={2}>
              {wunderPool.proposals
                .filter(
                  (p) => p.executed == true || p.noVotes > p.totalVotes / 2
                )
                .sort((one, two) => two.createdAt.sub(one.createdAt))
                .map((proposal) => {
                  return (
                    <ProposalCard
                      key={`proposal-${proposal.id}`}
                      proposal={proposal}
                      {...props}
                    />
                  );
                })}
            </Stack>
          </Slide>
        )}
      </Box>
    </Stack>
  ) : (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack sx={{ textAlign: 'center' }}>
        <Typography variant="h5">There are no Proposals</Typography>
        <Typography className="mb-2 mt-3" variant="subtitle1">
          Create one now!
        </Typography>
      </Stack>
    </Paper>
  );
}
