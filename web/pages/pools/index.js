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
import { fetchPoolBalance } from '/services/contract/pools';
import getPoolInfo from '/components/pool/poolInfo';
import { currency } from '/services/formatter';
import useUser from '/hooks/useUser';

function PoolStructure(props) {
  const { pools, user, setOpen } = props;
  //const user = useUser();

  const superfunc = () => {
    {
      governanceTokenData.holders.map((holder, i) => {
        {
          holder.address;
        }
        {
          holder.address;
        }

        {
          holder.tokens.toString();
        }

        {
          holder.share.toString();
        }
      });
    }
  };

  return pools.map((pool, i) => {
    //console.log(
    //  await fetchPoolGovernanceToken(pool.address, pool.version.number)
    //);
    const [govTokens, poolTokens, sharesOfUserInPercent] = getPoolInfo(
      pool,
      user
    );
    console.log('poolTokens');
    console.log(poolTokens);
    console.log('govTokens');
    console.log(govTokens);
    console.log('sharesOfUserInPercent');
    console.log(sharesOfUserInPercent);

    return (
      <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
        <Paper
          className="container-white mb-4 pb-6 sm:pb-0 cursor-pointer md:mb-0 sm:mb-6"
          elevation={1}
          key={`pool-${i}`}
          sx={{ p: 2 }}
        >
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center">
              <Typography className="text-md">{pool.name}</Typography>
              <div className="bg-white hover:bg-[#ededed]  rounded-md border-2 border-kaico-extra-light-blue p-5 text-md font-semibold cursor-pointer"></div>
            </div>
            <Typography className="text-lg pt-3 font-semibold">
              Governnancetoken:
            </Typography>
            {pool.entryBarrier && (
              <Typography variant="subtitle1">
                Minimum Invest: $
                {displayWithDecimalPlaces(toEthString(pool.entryBarrier, 6), 2)}
              </Typography>
            )}
            <div className="flex flex-row justify-between items-center pb-4">
              <div className="flex flex-row justify-start items-center ">
                <PieChart
                  className="w-8 sm:w-6 my-1 mt-6"
                  data={[
                    {
                      title: 'One',
                      value: 100 - parseInt(sharesOfUserInPercent),
                      color: '#E4DFFF',
                    },
                    {
                      title: 'Two',
                      value: parseInt(sharesOfUserInPercent),
                      color: '#5F45FD',
                    },
                  ]}
                />

                <Typography className="text-md  pt-5 pl-3">
                  {sharesOfUserInPercent && sharesOfUserInPercent}%
                </Typography>
              </div>

              <div className="flex flex-row  mt-4">
                <div className="flex border-solid text-black rounded-full bg-green-400 w-8 h-8 items-center justify-center border-2 border-white">
                  <Typography className="text-sm">AR</Typography>
                </div>
                <div className="flex border-solid text-black rounded-full bg-red-400 w-8 h-8 items-center justify-center -ml-2 border-2 border-white">
                  <Typography className="text-sm">JF </Typography>
                </div>
                <div className="flex border-solid text-black rounded-full bg-blue-300 w-8 h-8 items-center justify-center -ml-2 border-2 border-white">
                  <Typography className="text-sm">DP</Typography>
                </div>
              </div>
            </div>
          </div>
        </Paper>
      </Link>
    );
  });
}

function PoolList(props) {
  const { pools, user, setOpen } = props;

  return pools.length > 0 ? (
    <div className="md:grid md:grid-cols-2 md:gap-6">
      <PoolStructure pools={pools} user={user} />
    </div>
  ) : (
    <div className="container-white">
      <div className="flex flex-col items-center ">
        <div className="border-solid text-kaico-blue rounded-full bg-kaico-extra-light-blue p-5 my-2 mt-6 mb-4">
          <MdGroups className="text-4xl" />
        </div>
        <Typography className="my-2 mb-10" variant="h7">
          No Pools joined yet
        </Typography>
        <button
          className="btn-kaico-white items-center w-full my-5 py-3 px-3 mb-8 text-md "
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
  const [userPools, setUserPools] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const alert = useAlert();

  const fetchPools = () => {
    setLoadingUser(true);
    user.fetchPools().then((pools) => {
      setUserPools(pools);
      setLoadingUser(false);
    });
  };

  useEffect(() => {
    if (!user.address) return;
    fetchPools();
  }, [user.address]);

  return (
    <>
      <div className="font-graphik">
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
                <Typography className=" text-2xl my-5 sm:text-4xl">
                  Hello {user?.wunderId},
                </Typography>
                <div className=" border-solid text-kaico-blue truncate rounded-lg bg-gray-300 p-3 ">
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
                className="btn-kaico w-full my-4 py-4 px-3 text-md cursor-pointer transition-colors sm:w-40 sm:my-0 sm:h-14 sm:mt-7 sm:py-0 "
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
                <BalanceBox className="w-10" {...props} />
              </div>

              <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                <div className="flex flex-row justify-between pb-4 b">
                  <Typography className="subheader subheader-sm">
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
                    user={user}
                    pools={userPools}
                    setOpen={setOpen}
                  />
                )}
              </div>
            </div>

            <div className="w-full pb-14 sm:pt-10">
              <Typography className="subheader pb-4 lg:text-2xl">
                Demo WunderPool
              </Typography>
              <PoolList pools={demoPools} setOpen={setOpen} />
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
