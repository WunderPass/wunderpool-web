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
import { Container, Paper, Skeleton, Typography } from '@mui/material';

function PoolStructure(props) {
  const { pools, setOpen } = props;

  return pools.map((pool, i) => {
    return (
      <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
        <Paper
          className="container-white mb-4 pb-6 sm:pb-0 sm:mb-0 cursor-pointer"
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
                {displayWithDecimalPlaces(toEthString(pool.entryBarrier, 6), 2)}
              </Typography>
            )}
            <div className="flex flex-row justify-between items-center p-1">
              <div className="flex flex-row justify-start items-center p-1">
                <PieChart
                  className="w-8 my-1 mt-6"
                  data={[
                    { title: 'One', value: 22, color: '#E4DFFF' },
                    { title: 'Two', value: 29, color: '#5F45FD' },
                  ]}
                />
                <Typography className="text-md font-semibold pt-5 pl-3">
                  29%
                </Typography>
              </div>

              <PieChart
                className="w-8 my-1 mt-6 m-1"
                data={[{ title: 'One', value: 100, color: '#5F45FD' }]}
              />
            </div>
          </div>
        </Paper>
      </Link>
    );
  });
}

function PoolList(props) {
  const { pools, setOpen } = props;

  return pools.length > 0 ? (
    <div className="grid grid-cols-2 gap-8">
      <PoolStructure pools={pools} />
    </div>
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
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pb-4 sm:pt-10 sm:pb-10">
              <div>
                <Typography className="font-bold text-2xl my-5 sm:text-4xl">
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
              </div>
              <button
                className="btn-kaico w-full my-4 rounded-xl py-4 px-3 text-md font-semibold cursor-pointer transition-colors sm:w-40 sm:my-0 sm:h-14 sm:mt-7 sm:py-0 "
                onClick={() => setOpen(true)}
              >
                Create pool
              </button>
            </div>

            <div className="sm:flex sm:flex-row">
              <div className="flex flex-col sm:w-1/2 sm:pr-8">
                <Typography className="subheader subheader-sm my-4 sm:my-0 sm:pb-4">
                  Balance
                </Typography>
                <BalanceBox className="w-10" />
              </div>

              <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                <div className="flex flex-row justify-between pb-4 b">
                  <Typography className="subheader subheader-sm md:text-red-500 lg:text-blue-500">
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
            </div>

            <div className="w-full pl-1 md:pl-3 ">
              <Typography className="subheader pb-4 lg:text-2xl">
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
