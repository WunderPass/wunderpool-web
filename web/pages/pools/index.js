import { Button, Container, IconButton, Paper, Skeleton, Stack, Typography } from "@mui/material";
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAllPools, fetchUserPools } from "/services/contract/pools";
import NewPoolDialog from "/components/dialogs/newPool";
import { toEthString } from "/services/formatter";

function PoolList(props) {
  const {pools, setOpen} = props;

  return(
    pools.length > 0 ? 
      pools.map((pool, i) => {
        return (
          <Paper elevation={3} key={`pool-${i}`} sx={{p: 2}}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack spacing={1}>
                <Typography variant="h6">{pool.name}</Typography>
                {pool.entryBarrier && <Typography variant="subtitle1">Minimum Invest: {toEthString(pool.entryBarrier, 6)} USD</Typography>}
              </Stack>
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
  const [allPools, setAllPools] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchPools = () => {
    setLoadingAll(true);
    setLoadingUser(true);
    fetchUserPools(user.address).then(pools => {
      setUserPools(pools);
      setLoadingUser(false);
    })
    fetchAllPools(user.address).then(pools => {
      setAllPools(pools);
      setLoadingAll(false);
    })
  }

  useEffect(() => {
    if(user.address) fetchPools();
  }, [user.address])

  return (
    <Container maxWidth="md">
      <Stack spacing={3} paddingTop={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h3">{user?.wunderId}'s WunderPools</Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setOpen(true)} variant="contained" color="success">New</Button>
            <IconButton onClick={user?.logOut} color="error"><LogoutIcon/></IconButton>
          </Stack>
        </Stack>
        <Typography variant="h6">Your WunderPools</Typography>
        {loadingUser ? 
          <Skeleton variant="rectangular" width="100%" sx={{height: "100px", borderRadius: 3}} /> :
          <PoolList pools={userPools} setOpen={setOpen}/>
        }
        <Typography variant="h6">All WunderPools</Typography>
        {loadingAll ? 
          <Skeleton variant="rectangular" width="100%" sx={{height: "100px", borderRadius: 3}} /> :
          <PoolList pools={allPools} setOpen={setOpen}/>
        }
      </Stack>
      <NewPoolDialog open={open} setOpen={setOpen} fetchPools={fetchPools} {...props}/>
    </Container>
  )
}