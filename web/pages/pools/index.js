import {
  Button,
  Container,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import WunderPoolIcon from "/public/wunderpool_logo_white.svg";
import USDCIcon from "/public/usdc-logo.svg";
import LogoutIcon from '@mui/icons-material/Logout';
import { useEffect, useState } from 'react';
import { fetchAllPools, fetchUserPools } from '/services/contract/pools';
import NewPoolDialog from '/components/dialogs/newPool';
import { toEthString } from '/services/formatter';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";


function PoolList(props) {
  const { pools, setOpen } = props;

  return pools.length > 0 ? (
    pools.map((pool, i) => {
      return (
        <Paper elevation={3} key={`pool-${i}`} sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack spacing={1}>
              <Typography variant="h6">{pool.name}</Typography>
              {pool.entryBarrier && (
                <Typography variant="subtitle1">
                  Minimum Invest: {toEthString(pool.entryBarrier, 6)} USD
                </Typography>
              )}
            </Stack>
            <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
              <IconButton>
                <ArrowCircleRightOutlinedIcon color="primary" />
              </IconButton>
            </Link>
          </Stack>
        </Paper>
      );
    })
  ) : (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack sx={{ textAlign: 'center' }}>
        <Typography variant="h5">There are no Pools</Typography>
        <Typography variant="subtitle1">Create one now!</Typography>
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color="success"
        >
          New
        </Button>
      </Stack>
    </Paper>
  );
}

export default function Pools(props) {
  const { user } = props;
  const [allPools, setAllPools] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchPools = () => {
    setLoadingAll(true);
    setLoadingUser(true);
    fetchUserPools(user.address).then((pools) => {
      setUserPools(pools);
      setLoadingUser(false);
    });
    fetchAllPools(user.address).then((pools) => {
      setAllPools(pools);
      setLoadingAll(false);
    });
  };

  useEffect(() => {
    if (user.address) fetchPools();
  }, [user.address]);

  return (
    <>
      <Head>
        <title>WunderPass NFT</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
      <AppBar
        className="bg-gradient-to-r from-cyan-500 to-blue-600"
        position="static"
      >
        <Toolbar>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
            <Link href="/">
              <a>
                <div className="flex flex-row">
                  <div className="pt-0.5 w-44 pr-3">
                    <Image
                      src={WunderPoolIcon}
                      alt="WunderPassIcon"
                      layout="responsive"
                    />

                  </div>

                </div>
              </a>
            </Link>

          </Stack>

          <div className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit p-1">

            <div className="flex flex-row justify-between pr-1">

              <div className="flex w-7 p-0.5 mb-0.5 rounded-full border-2">
                <Image
                  src={USDCIcon}
                  alt="fill"
                  layout="intrinsic"

                />
              </div>
              <div className="text-center" //TODO GET BALANCE HERE
              >
                &nbsp;
                5000.5
              </div>
              <div className="text-center">&nbsp;USDC</div>
            </div>

          </div>


        </Toolbar>
      </AppBar>

      <Container >
        <Stack spacing={3} paddingTop={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <div className="flex flex-col">
              <div className="flex flex-col justify-between border-solid border-2 border-[#ADD8E6] mb-1 mt-0 rounded-md bg-white p-2 m-1 sm:mr-8 w-full shadow-xl">
                <Typography variant="h3" className="font-bold">
                  {user?.wunderId}
                </Typography>
                <Typography variant="h6">Address: {user.address}</Typography>
              </div>
            </div>

            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => setOpen(true)}
                variant="contained"
                color="success"
              >
                New
              </Button>
              <IconButton onClick={user?.logOut} color="error">
                <LogoutIcon />
              </IconButton>
            </Stack>
          </Stack>
          <Typography variant="h6">Your WunderPools</Typography>
          {loadingUser ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{ height: '100px', borderRadius: 3 }}
            />
          ) : (
            <PoolList pools={userPools} setOpen={setOpen} />
          )}
          <Typography variant="h6">All WunderPools</Typography>
          {loadingAll ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{ height: '100px', borderRadius: 3 }}
            />
          ) : (
            <PoolList pools={allPools} setOpen={setOpen} />
          )}
        </Stack>
        <NewPoolDialog
          open={open}
          setOpen={setOpen}
          fetchPools={fetchPools}
          {...props}
        />
      </Container>
    </>

  );
}
