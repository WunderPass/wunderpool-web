import { Button, Paper, Stack, Typography } from "@mui/material";
import ProposalCard from "./proposalCard";

export default function ProposalList(props) {
  const {proposals, setApe} = props;

  return(
    proposals.length > 0 ? 
      <Stack spacing={3}>
        <Typography variant="h4">Proposals</Typography>
        {proposals.sort((one, two) => two.createdAt.sub(one.createdAt)).map(proposal => {
          return (
            <ProposalCard key={`proposal-${proposal.id}`} proposal={proposal} {...props} />
          )
        })}
      </Stack>
    : 
    <Paper elevation={3} sx={{p: 2}}>
      <Stack sx={{textAlign: 'center'}}>
        <Typography variant="h5">There are no Proposals</Typography>
        <Typography variant="subtitle1">Create one now!</Typography>
        <Button onClick={() => setApe(true)} variant="contained" color="success">New</Button>
      </Stack>
    </Paper>
  )
}