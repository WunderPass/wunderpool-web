import { Container, IconButton, Paper, Stack, Typography } from "@mui/material";
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import Link from "next/link";

const pools = [
  {
    id: 0,
    name: 'WunderPass Team'
  },
  {
    id: 1,
    name: 'Crypto Apes'
  },
]

export default function Pools(props) {
  const {user} = props;

  return (
    <Container maxWidth="md">
      <Stack spacing={3}>
        <Typography variant="h3">{user?.wunderId}'s WunderPools</Typography>
        {pools.map((pool, i) => {
          return (
            <Paper key={`pool-${i}`} sx={{p: 2}}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{pool.name}</Typography>
                <Link href={`/pools/${pool.id}`}>
                  <IconButton>
                    <ArrowCircleRightOutlinedIcon color="primary"/>
                  </IconButton>
                </Link>
              </Stack>
            </Paper>
          )
        })}
      </Stack>
    </Container>
  )
}