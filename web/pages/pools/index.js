import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { fetchAllPools, fetchUserPools } from '/services/contract/pools';
import ClipboardIcon from '/public/Vectorclipboard.svg';
import NewPoolDialog from '/components/dialogs/newPool';
import { toEthString, displayWithDecimalPlaces } from '/services/formatter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useEffect, useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { useAlert } from 'react-alert';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
MdContentCopy;

import {
  Toolbar,
  AppBar,
  Container,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

function PoolList(props) {
  const { pools, setOpen } = props;

  return pools.length > 0 ? (
    pools.map((pool, i) => {
      return (
        <Paper
          className="mb-4 pb-6"
          elevation={1}
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
                  Minimum Invest: $
                  {displayWithDecimalPlaces(
                    toEthString(pool.entryBarrier, 6),
                    2
                  )}
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
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack sx={{ textAlign: 'center' }}>
        <Typography className="pb-2" variant="h5">
          There are no pools yet
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function Pools(props) {
  const { user } = props;
  const [demoPools, setDemoPools] = useState([]);
  const [allPools, setAllPools] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const alert = useAlert();

  const fetchPools = () => {
    setLoadingAll(true);
    setLoadingUser(true);
    user.fetchPools().then((pools) => {
      setUserPools(pools);
      setLoadingUser(false);
    });
    fetchAllPools().then((pools) => {
      setAllPools(pools);
      setLoadingAll(false);
    });
  };

  useEffect(() => {
    if (!user.address) return;
    fetchPools();
  }, [user.address]);

  return (
    <>
      <div
      //className="bg-gradient-to-b from-wunder-blue via-white to-[#f0ffff]"  //PLAY AROUND HERE AND CHECK IF BACKGROUND IS NICE
      >
        <Head>
          <title>WunderPool</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <Container>
          <Stack spacing={3} paddingTop={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <div className="flex flex-col w-full justify-start">
                <div>
                  <Typography className="font-bold text-2xl my-3">
                    Hello {user?.wunderId},
                  </Typography>
                  <div className=" border-solid text-kaico-blue truncate rounded-lg bg-gray-300 p-3 shadow-xl">
                    <CopyToClipboard
                      text={user?.address}
                      onCopy={() => alert.show('address copied!')}
                    >
                      <span className=" cursor-pointer text-md">
                        <div className="flex flex-row items-center">
                          <div className="truncate ...">{user?.address}</div>
                          <MdContentCopy className="text-gray-500 ml-4" />
                        </div>
                      </span>
                    </CopyToClipboard>
                  </div>
                  <button
                    className="btn-kaico w-full hover:bg-white my-4 rounded-xl py-4 px-3 text-md font-semibold cursor-pointer transition-colors "
                    onClick={() => setOpen(true)}
                  >
                    Create pool
                  </button>
                </div>
                <Typography className="font-bold text-xl my-4">
                  Balance
                </Typography>
                <div className="flex flex-col justify-between container-kaico mb-1 m:mr-8 w-full ">
                  <Typography className="pb-6">Total Balance</Typography>
                  <Typography className="text-3xl font-bold">
                    $12,223
                  </Typography>
                  <Typography className="">Total Balance</Typography>
                </div>
              </div>
            </Stack>
            <div></div>

            <div className="flex flex-col md:flex-row justify-between">
              <div className="w-full pr-1 mb-8 md:mr-3 md:mb-0">
                <div className="flex flex-row justify-between pb-4">
                  <Typography className="text-xl text-black font-bold lg:text-2xl">
                    My WunderPools
                  </Typography>
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
                <Typography className="text-xl text-black font-bold pb-5 lg:text-2xl">
                  Demo WunderPool
                </Typography>
                {loadingAll ? (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{ height: '100px', borderRadius: 3 }}
                  />
                ) : (
                  <PoolList pools={demoPools} setOpen={setOpen} />
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
      </div>
    </>
  );
}
