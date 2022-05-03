import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { fetchAllPools, fetchUserPools } from '/services/contract/pools';
import NewPoolDialog from '/components/dialogs/newPool';
import { toEthString, displayWithDecimalPlaces } from '/services/formatter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import Head from 'next/head';
import Link from 'next/link';
import {
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
                <div className="flex flex-col justify-between border-solid border-2 border-[#ADD8E6] mb-1  rounded-md bg-white p-2 sm:mr-8 w-full shadow-xl">
                  <Typography variant="h3" className="font-bold">
                    {user?.wunderId}
                  </Typography>
                  <CopyToClipboard
                    text={user?.address}
                    onCopy={() => alert.show('address copied!')}
                  >
                    <span className="truncate ... cursor-pointer text-md">
                      {user?.address}
                    </span>
                  </CopyToClipboard>
                  <Typography
                    className="truncate ... "
                    variant="h6"
                  ></Typography>{' '}
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
                  <button
                    className="text-white btn mb-4 hover:bg-[#228B22]"
                    onClick={() => setOpen(true)}
                    variant="contained"
                    color="success"
                  >
                    Create new pool
                  </button>
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
      </div>
    </>
  );
}
