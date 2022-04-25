import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { fetchAllPools, fetchUserPools } from '/services/contract/pools';
import WunderPoolIcon from '/public/wunderpool_logo_white.svg';
import NewPoolDialog from '/components/dialogs/newPool';
import LogoutIcon from '@mui/icons-material/Logout';
import { toEthString, displayWithDecimalPlaces } from '/services/formatter';
import USDCIcon from '/public/usdc-logo.svg';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
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

function PoolList(props) {
  const { pools, setOpen } = props;

  return pools.length > 0 ? (
    pools.map((pool, i) => {
      return (
        <Paper
          className="mb-4 pb-6"
          elevation={3}
          key={`pool-${i}`}
          sx={{ p: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack spacing={1}>
              <Typography variant="h6">{pool.name}</Typography>
              {pool.entryBarrier && (
                <Typography variant="subtitle1">
                  Minimum Invest:{' '}
                  {displayWithDecimalPlaces(
                    toEthString(pool.entryBarrier, 6),
                    2
                  )}{' '}
                  $
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
        <Typography className="pb-2" variant="h5">
          There are no Pools
        </Typography>
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
        <title>WunderPool</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
                      alt="WunderPoolIcon"
                      layout="responsive"
                    />
                  </div>
                </div>
              </a>
            </Link>
          </Stack>

          <div className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit p-0.5">
            <div className="flex flex-row pr-1 text-center items-center text-sm font-bold">
              <div className="flex w-7 rounded-full border-2">
                <Image src={USDCIcon} alt="fill" layout="intrinsic" />
              </div>
              <div
                className="text-center" //TODO GET BALANCE HERE
              >
                &nbsp; 5000.50
                {user?.balance}
              </div>
              <div className="text-center mr-0.5">&nbsp;USDC</div>
            </div>
          </div>
          <Button
            className="btn ml-2 hover:bg-[#ff0000]"
            onClick={user?.logOut}
            variant="contained"
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <Stack spacing={3} paddingTop={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <div className="flex flex-col w-full justify-start">
              <div className="flex flex-col justify-between border-solid border-2 border-[#ADD8E6] mb-1  rounded-md bg-white p-2 sm:mr-8 w-full shadow-xl">
                <Typography variant="h3" className="font-bold">
                  {user?.wunderId}
                </Typography>
                <Typography variant="h6">Address: {user?.address}</Typography>
              </div>
            </div>
          </Stack>
          <div></div>

          <div className="flex flex-col md:flex-row justify-between">
            <div className="w-full pr-1 mb-8 md:mr-3 md:mb-0">
              <div className="flex flex-row justify-between">
                <Typography className="text-xl text-black font-bold pb-6 lg:text-2xl">
                  Your WunderPools
                </Typography>
                <Button
                  className="btn mb-4"
                  onClick={() => setOpen(true)}
                  variant="contained"
                  color="success"
                >
                  Create new pool
                </Button>
              </div>

              {loadingUser ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  sx={{ height: '100px', borderRadius: 3 }}
                />
              ) : (
                <PoolList
                  className="mx-4"
                  pools={userPools}
                  setOpen={setOpen}
                />
              )}
            </div>
            <div className="w-full pl-1 md:pl-3 ">
              <Typography className="text-xl text-black font-bold pb-6 lg:text-2xl">
                All WunderPools
              </Typography>
              {loadingAll ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  sx={{ height: '100px', borderRadius: 3 }}
                />
              ) : (
                <PoolList pools={allPools} setOpen={setOpen} />
              )}
            </div>
          </div>
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
