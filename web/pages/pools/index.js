import NewPoolDialog from '/components/dialogs/newPool';
import BalanceBox from '/components/pool/balanceBox';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import Head from 'next/head';
import PoolList from './poolList';
import { Container, Pagination, Skeleton, Typography } from '@mui/material';

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
