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
  Pagination,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import getPoolInfo from '/components/pool/poolInfo';
import { currency } from '/services/formatter';
import InitialsAvatar from '/components/utils/initialsAvatar';
import { ethers } from 'ethers';

function WhiteListedPools(props) {
  const { pools } = props;

  if (pools.length == 0) return null;

  return (
    <Paper
      className="bg-green-300 mb-2 sm:mb-5 rounded-xl"
      elevation={1}
      sx={{ p: 2 }}
    >
      <p className="subheader subheader-sm my-1">
        You were invited to join{' '}
        {pools.length == 1 ? 'this Pool' : 'these Pools'}
      </p>
      {pools.map((pool, i) => {
        return (
          <Link
            key={`pool-${i}`}
            href={`/pools/${pool.address}?name=${pool.name}`}
            passHref
          >
            <Paper
              className="hover:bg-gray-100 container-white cursor-pointer "
              elevation={1}
              sx={{ p: 2, my: 1 }}
            >
              <div className="flex flex-row justify-between items-center ">
                <Typography className="text-md">{pool.name}</Typography>
              </div>
            </Paper>
          </Link>
        );
      })}
    </Paper>
  );
}

function PoolCard(props) {
  const { pool, user, setOpen } = props;

  const [totalBalance, sharesOfUserInPercent, members, isReady] = getPoolInfo(
    pool,
    user
  );
  // const [totalBalance, sharesOfUserInPercent, members, isReady] = [
  //   100,
  //   33,
  //   [
  //     { share: ethers.BigNumber.from(33), wunderId: 'd-bitschnau' },
  //     { share: ethers.BigNumber.from(33), wunderId: 'm-loechner' },
  //     { share: ethers.BigNumber.from(33), wunderId: 's-tschurilin' },
  //   ],
  //   true,
  // ];

  return isReady ? (
    <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
      <Paper
        className="container-white mb-4 pb-6 sm:pb-0 cursor-pointer md:mb-0 sm:mb-6"
        elevation={1}
        sx={{ p: 2 }}
      >
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <Typography className="text-md">{pool.name}</Typography>
            <div className="bg-white hover:bg-[#ededed]  rounded-md border-2 border-kaico-extra-light-blue p-5 text-md font-semibold cursor-pointer"></div>
          </div>
          <Typography className="text-lg pt-3 font-semibold">
            {currency(totalBalance, {})}
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
                {sharesOfUserInPercent &&
                  `${sharesOfUserInPercent}% (${currency(
                    (totalBalance / 100) * sharesOfUserInPercent,
                    {}
                  )})`}
              </Typography>
            </div>

            <div className="flex flex-row  mt-4">
              {members &&
                members
                  .sort((a, b) => b.share.toNumber() - a.share.toNumber())
                  .slice(0, 3)
                  .map((member, i) => {
                    return (
                      <InitialsAvatar
                        key={`member-${i}`}
                        tooltip={`${
                          member.wunderId || 'External User'
                        }: ${member.share.toString()}%`}
                        text={member.wunderId ? member.wunderId : '0-X'}
                        separator="-"
                        color={['green', 'blue', 'red', 'teal'][i % 4]}
                      />
                    );
                  })}
            </div>
          </div>
        </div>
      </Paper>
    </Link>
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}

function PoolList(props) {
  const { pools, user, setOpen } = props;

  return pools.length > 0 ? (
    <div className="md:grid md:grid-cols-2 md:gap-6 w-full">
      {pools.map((pool, i) => {
        return <PoolCard key={`pool-card-${i}`} pool={pool} user={user} />;
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
  const pageSize = 4;

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

        <Container>
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
              <div>
                <Typography className=" text-2xl my-5 sm:text-4xl">
                  Hello {user?.wunderId},
                </Typography>
                <div className=" border-solid text-kaico-blue truncate rounded-lg bg-gray-300 p-3 ">
                  <CopyToClipboard
                    text={user?.address}
                    onCopy={() => handleSuccess('address copied!')}
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

            <WhiteListedPools pools={user.whitelistedPools} />

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
                    pools={user.pools.slice(
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
