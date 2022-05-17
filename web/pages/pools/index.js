import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { fetchAllPools, fetchUserPools } from '/services/contract/pools';
import NewPoolDialog from '/components/dialogs/newPool';
import BalanceBox from '/components/pool/balanceBox';
import { toEthString, displayWithDecimalPlaces } from '/services/formatter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useEffect, useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { PieChart } from 'react-minimal-pie-chart';
import { MdGroups } from 'react-icons/md';
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
        <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
          <Paper
            className="container-white mb-4 pb-6 cursor-pointer"
            elevation={1}
            key={`pool-${i}`}
            sx={{ p: 2 }}
          >
            <div className="flex flex-col">
              <div className="flex flex-row justify-between items-center">
                <Typography className="text-md font-semibold">
                  {pool.name}
                </Typography>
                <div className="bg-white hover:bg-[#ededed]  rounded-md border-2 border-kaico-extra-light-blue p-5 text-md font-semibold cursor-pointer"></div>
              </div>
              <Typography className="text-lg pt-3 font-semibold">
                $2,500 Balance
              </Typography>
              {pool.entryBarrier && (
                <Typography variant="subtitle1">
                  Minimum Invest: $
                  {displayWithDecimalPlaces(
                    toEthString(pool.entryBarrier, 6),
                    2
                  )}
                </Typography>
              )}
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row justify-start items-center">
                  <PieChart
                    className="w-8 my-1 mt-6"
                    data={[
                      { title: 'One', value: 43, color: '#E4DFFF' },
                      { title: 'Two', value: 22, color: '#5F45FD' },
                    ]}
                  />
                  <Typography className="text-md font-semibold pt-5 pl-3">
                    29%
                  </Typography>
                </div>

                <PieChart
                  className="w-8 my-1 mt-6"
                  data={[{ title: 'One', value: 100, color: '#5F45FD' }]}
                />
              </div>
            </div>
          </Paper>
        </Link>
      );
    })
  ) : (
    <div className="container-white">
      <div className="flex flex-col items-center ">
        <div className="border-solid text-kaico-blue rounded-full bg-kaico-extra-light-blue p-5 my-2 mb-4">
          <MdGroups className="text-4xl" />
        </div>
        <Typography className="font-bold my-2" variant="h7">
          No Pools joined yet
        </Typography>
        <button
          className="items-center w-full bg-white hover:bg-[#ededed] my-5 rounded-xl border-2 border-kaico-extra-light-blue py-3 px-3 text-md font-semibold cursor-pointer transition-colors"
          onClick={() => setOpen(true)}
        >
          Create pool
        </button>
      </div>
    </div>
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
                  <Typography className="font-bold text-2xl my-5">
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
                    className="btn-kaico w-full my-4 rounded-xl py-4 px-3 text-md font-semibold cursor-pointer transition-colors "
                    onClick={() => setOpen(true)}
                  >
                    Create pool
                  </button>
                </div>
                <Typography className="subheader my-4">Balance</Typography>
                <BalanceBox />
              </div>
            </Stack>
            <div></div>

            <div className="flex flex-col md:flex-row justify-between">
              <div className="w-full pr-1 mb-8 md:mr-3 md:mb-0">
                <div className="flex flex-row justify-between pb-4">
                  <Typography className="subheader lg:text-2xl">
                    My Pools
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
                <Typography className="subheader pb-5 lg:text-2xl">
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
