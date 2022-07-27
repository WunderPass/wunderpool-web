import BalanceBox from '/components/pool/balanceBox';
import { currency } from '/services/formatter';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { MdGroups } from 'react-icons/md';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Pagination,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import Avatar from '/components/utils/avatar';
import NewPoolDialog from '/components/dialogs/newPool/dialog';
import LoadingCircle from '/components/utils/loadingCircle';
import InitialsAvatar from '/components/utils/initialsAvatar';

function PoolCard(props) {
  const { pool } = props;
  const members = pool.members;

  return (
    <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
      <Paper
        className="container-white mb-4 pb-6 sm:pb-0 cursor-pointer lg:mb-0 sm:mb-6"
        elevation={1}
        sx={{ p: 2 }}
      >
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <Typography className="text-md">{pool.name}</Typography>
            <div className="bg-white hover:bg-[#ededed]  rounded-md border-2 border-kaico-extra-light-blue p-5 text-md font-semibold cursor-pointer"></div>
          </div>
          <Typography className="text-lg pt-3 font-semibold">
            {currency(pool.totalBalance)}
          </Typography>
          <div className="flex flex-row justify-between items-center pb-4">
            <div className="flex flex-row justify-start items-center ">
              <PieChart
                className="w-8 sm:w-6 my-1 mt-6"
                data={[
                  {
                    title: 'One',
                    value: 100 - parseInt(pool.userShare),
                    color: '#E4DFFF',
                  },
                  {
                    title: 'Two',
                    value: parseInt(pool.userShare),
                    color: '#5F45FD',
                  },
                ]}
              />

              <Typography className="text-md  pt-5 pl-3">
                {pool.userShare &&
                  `${parseInt(pool.userShare)}% (${currency(
                    pool.userBalance
                  )})`}
              </Typography>
            </div>

            <div className="flex flex-row   mt-4">
              <div className="flex flex-row">
                {members &&
                  members
                    .sort((a, b) => b.share - a.share)
                    .slice(0, 3)
                    .map((member, i) => {
                      return (
                        <Avatar
                          key={`avatar-${pool.address}-${i}`}
                          wunderId={member.wunderId ? member.wunderId : null}
                          tooltip={`${
                            member.wunderId || 'External User'
                          }: ${member.share.toFixed(0)}%`}
                          text={member.wunderId ? member.wunderId : '0-X'}
                          separator="-"
                          color={['green', 'blue', 'red'][i % 3]}
                          i={i}
                        />
                      );
                    })}
              </div>
              {members && members.length > 3 && (
                <div className="flex flex-row">
                  <InitialsAvatar
                    text={`+${members.length - 3}`}
                    color={'casama'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Paper>
    </Link>
  );
}

function PoolList(props) {
  const { pools, setOpen } = props;

  return pools.length > 0 ? (
    <div className="lg:grid lg:grid-cols-2 lg:gap-6 w-full">
      {pools.map((pool, i) => {
        return <PoolCard key={`pool-card-${i}`} pool={pool} />;
      })}
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
  const { user, handleSuccess } = props;
  const [demoPools, setDemoPools] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingCircle, setLoadingCircle] = useState(true);

  const pageSize = 4;

  useEffect(() => {}, [user]);

  useEffect(() => {
    setLoadingCircle(!user.isReady);
  }, [user.isReady]);

  return (
    <>
      <div className="font-graphik">
        <Head>
          <title>Casama</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        {loadingCircle && <LoadingCircle />}
        <Container className={loadingCircle && 'blur'}>
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
              <Typography className=" text-2xl mt-5 sm:text-4xl">
                Hello {user?.wunderId},
              </Typography>
              <button
                className="btn-kaico w-full mt-5 py-4 px-3 text-md cursor-pointer transition-colors sm:w-40 sm:my-0 sm:h-14 sm:py-0 "
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
                  {user.pools.length > pageSize && (
                    <Pagination
                      count={Math.ceil(user.pools.length / pageSize)}
                      page={page}
                      onChange={(_, val) => {
                        setPage(val);
                      }}
                    />
                  )}
                </div>

                {user.isReady ? (
                  <PoolList
                    className="mx-4"
                    user={user}
                    pools={user.pools
                      .sort((a, b) => b.totalBalance - a.totalBalance)
                      .slice(
                        (page - 1) * pageSize,
                        (page - 1) * pageSize + pageSize
                      )}
                    setOpen={setOpen}
                  />
                ) : (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{ height: '100px', borderRadius: 3 }}
                  />
                )}
              </div>
            </div>

            <div className="w-full pb-14 sm:pt-10">
              <Typography className="subheader pb-4 lg:text-2xl">
                Demo Pool
              </Typography>
              <PoolList pools={demoPools} setOpen={setOpen} />
            </div>
          </div>

          <NewPoolDialog
            open={open}
            setOpen={setOpen}
            fetchPools={user.fetchPools}
            {...props}
          />
        </Container>
      </div>
    </>
  );
}
