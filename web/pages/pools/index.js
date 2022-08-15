import BalanceBox from '/components/pool/balanceBox';
import { currency } from '/services/formatter';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  Tooltip,
} from '@mui/material';
import Avatar from '/components/utils/avatar';
import NewPoolDialog from '/components/dialogs/newPool/dialog';
import LoadingCircle from '/components/utils/loadingCircle';
import InitialsAvatar from '/components/utils/initialsAvatar';
import { cacheImageByURL } from '../../services/caching';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { BsChevronDown } from 'react-icons/bs';
import { BsChevronUp } from 'react-icons/bs';
import { AiFillUpCircle } from 'react-icons/ai';
import { AiOutlineDownCircle } from 'react-icons/ai';

function PoolCard(props) {
  const { pool } = props;
  const [imageUrl, setImageUrl] = useState(false);
  const members = pool.members;

  useEffect(async () => {
    setImageUrl(null);
    if (!pool.address) return;
    setImageUrl(
      await cacheImageByURL(
        `pool_image_${pool.address}`,
        `/api/proxy/pools/getImage?address=${pool.address}`,
        600
      )
    );
  }, [pool.address]);

  return (
    <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
      <Paper
        className={`container-white mb-4 pb-6 sm:pb-0 cursor-pointer lg:mb-0 sm:mb-6 relative overflow-hidden`}
        elevation={1}
        sx={{ p: 2 }}
      >
        <div className="flex flex-col relative">
          <div className="flex flex-row justify-between items-center">
            <Typography className="text-md">{pool.name}</Typography>
            <div
              className={`bg-white hover:bg-[#ededed] rounded-md border-kaico-extra-light-blue text-md font-semibold cursor-pointer ${
                imageUrl ? '' : 'p-6 border-2'
              }`}
            >
              {imageUrl && (
                <img
                  className="object-cover w-12 h-12 rounded-md"
                  src={imageUrl}
                  type="file"
                />
              )}
            </div>
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
          className="btn-kaico-white items-center w-full my-5 py-3 px-3 mb-4 text-md "
          onClick={() => setOpen(true)}
        >
          Create your first pool
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
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const [showAddress, setShowAddress] = useState(false);
  const router = useRouter();

  const pageSize = 4;

  const toggleAddress = () => {
    setShowAddress(!showAddress);
  };

  useEffect(() => {}, [user]);

  const handleOpenClose = () => {
    if (open) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'createPool' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.dialog ? true : false);
  }, [router.query]);

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
        <Container className={loadingCircle ? 'blur' : ''}>
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
              <div className="flex flex-col">
                <div className="flex flex-row items-center">
                  <Typography className=" text-2xl mt-5 sm:text-4xl mb-2">
                    Hello {user?.wunderId}
                  </Typography>
                  <Tooltip
                    title={
                      showAddress
                        ? 'Hide your wallet address'
                        : 'Show your wallet address'
                    }
                  >
                    <button onClick={() => toggleAddress()}>
                      {showAddress ? (
                        <div className="flex flex-row items-center">
                          <AiFillUpCircle className="text-kaico-blue sm:text-2xl font-bold text-xl mt-3 sm:mt-4 ml-2 sm:ml-4" />
                        </div>
                      ) : (
                        <div className="flex flex-row items-center">
                          <AiOutlineDownCircle className="text-kaico-blue sm:text-2xl text-xl font-bold mt-3 sm:mt-4 ml-2 sm:ml-4" />
                        </div>
                      )}
                    </button>
                  </Tooltip>
                </div>

                <div
                  className={
                    showAddress
                      ? ' border-solid text-kaico-blue truncate rounded-lg bg-gray-300 p-3 '
                      : ' border-solid text-kaico-blue truncate rounded-lg bg-gray-300 p-3 hidden'
                  }
                >
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
                className="btn-kaico w-full mt-5 py-4 px-3 text-md cursor-pointer transition-colors sm:w-40 sm:my-0 sm:h-14 sm:py-0 "
                onClick={handleOpenClose}
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
          </div>

          <NewPoolDialog
            open={open}
            setOpen={handleOpenClose}
            fetchPools={user.fetchPools}
            {...props}
          />
        </Container>
      </div>
    </>
  );
}
