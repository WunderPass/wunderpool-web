import { Button, Container, IconButton, Paper, Skeleton, Stack, Typography } from "@mui/material";
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserPools } from "/services/contract/pools";
import NewPoolDialog from "../../components/dialogs/newPool";

function PoolList(props) {
  const {pools, setOpen} = props;

  return(
    pools.length > 0 ? 
      pools.map((pool, i) => {
        return (
          <Paper elevation={3} key={`pool-${i}`} sx={{p: 2}}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{pool.name}</Typography>
              <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
                <IconButton>
                  <ArrowCircleRightOutlinedIcon color="primary"/>
                </IconButton>
              </Link>
            </Stack>
          </Paper>
        )
      })
    : 
    <Paper elevation={3} sx={{p: 2}}>
      <Stack sx={{textAlign: 'center'}}>
        <Typography variant="h5">There are no Pools</Typography>
        <Typography variant="subtitle1">Create one now!</Typography>
        <Button onClick={() => setOpen(true)} variant="contained" color="success">New</Button>
      </Stack>
    </Paper>
  )
}

export default function Pools(props) {
  const {user} = props;
  const [pools, setPools] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPools = () => {
    setLoading(true);
    fetchUserPools(user.address).then(pools => {
      setPools(pools);
      setLoading(false);
    })
  }

  useEffect(() => {
    fetchPools();
  }, [])

  return (
    <Container maxWidth="md">
      <Stack spacing={3} paddingTop={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h3">{user?.wunderId}'s WunderPools</Typography>
          <Button onClick={() => setOpen(true)} variant="contained" color="success">New</Button>
        </Stack>
        {loading ? 
          <Skeleton variant="rectangular" width="100%" sx={{height: "100px", borderRadius: 3}} /> :
          <PoolList pools={pools} setOpen={setOpen}/>
        }
      </Stack>
      <NewPoolDialog open={open} setOpen={setOpen} fetchPools={fetchPools} {...props}/>
    </Container>
  )
}