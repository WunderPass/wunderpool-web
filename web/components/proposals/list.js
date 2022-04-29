import {
  Box,
  Button,
  Paper,
  Slide,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useRef } from "react";
import { useState } from "react";
import ProposalCard from "./proposalCard";

export default function ProposalList(props) {
  const { proposals, setApe } = props;
  const [tab, setTab] = useState(0);
  const slidingContainer = useRef(null);

  return proposals.length > 0 ? (
    <Stack spacing={1}>
      <Typography variant="h4">Proposals</Typography>
      <Tabs value={tab} onChange={(_, val) => setTab(val)}>
        <Tab label="Open" sx={{ maxWidth: "unset", flexGrow: 1 }} />
        <Tab label="Closed" sx={{ maxWidth: "unset", flexGrow: 1 }} />
      </Tabs>
      <Box ref={slidingContainer} p={1} overflow="hidden">
        {tab == 0 && (
          <Slide
            container={slidingContainer.current}
            direction="right"
            in={tab == 0}
          >
            <Stack spacing={2}>
              {proposals
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
              {proposals
                .filter((p) => p.executed == true)
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
      <Stack sx={{ textAlign: "center" }}>
        <Typography variant="h5">There are no Proposals</Typography>
        <Typography variant="subtitle1">Create one now!</Typography>
        <Button
          onClick={() => setApe(true)}
          variant="contained"
          color="success"
        >
          New
        </Button>
      </Stack>
    </Paper>
  );
}
