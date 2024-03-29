import BalanceBox from '/components/investing/pool/balanceBox';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Pagination,
  Skeleton,
  Typography,
  Tooltip,
} from '@mui/material';
import AdvancedPoolDialog from '/components/investing/dialogs/advancedPool/dialog';
import QuickPoolDialog from '/components/investing/dialogs/quickPool/dialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { AiFillUpCircle } from 'react-icons/ai';
import { AiOutlineDownCircle } from 'react-icons/ai';
import PoolList from '/components/investing/dashboard/poolList';
import CustomHeader from '/components/general/utils/customHeader';
import PublicPools from '/components/investing/dashboard/publicPools';
import QrCode from '/components/general/utils/qrCode';

export default function Pools(props) {
  const { user, handleSuccess, updateListener, isMobile } = props;
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [openQuick, setOpenQuick] = useState(false);
  const [page, setPage] = useState(1);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const [showAddress, setShowAddress] = useState(false);
  const router = useRouter();

  const pageSize = 4;

  const toggleAddress = () => {
    setShowAddress(!showAddress);
  };

  const formatAddress = (str) => {
    if (!str) return '';
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  const handleOpenCloseAdvanced = () => {
    if (openAdvanced) {
      goBack(() => removeQueryParam('advancedPool'));
    } else {
      addQueryParam({ advancedPool: 'advancedPool' }, false);
    }
  };

  const handleOpenCloseQuick = () => {
    if (openQuick) {
      goBack(() => removeQueryParam('quickPool'));
    } else {
      addQueryParam({ quickPool: 'quickPool' }, false);
    }
  };

  useEffect(() => {
    setOpenAdvanced(router.query?.advancedPool ? true : false);
    setOpenQuick(router.query?.quickPool ? true : false);
  }, [router.query]);

  useEffect(() => {
    if (user.pools.length > 0) updateListener(user.pools, null, user.address);
  }, [user.pools]);

  return (
    <>
      <CustomHeader />
      <div className="font-graphik">
        <Container>
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
              <div className="flex flex-col">
                <div className="flex flex-row items-center">
                  <Typography className=" text-2xl mt-5 sm:text-4xl mb-2 font-medium">
                    Pool Dashboard
                  </Typography>
                  <Tooltip
                    title={
                      showAddress
                        ? 'Hide your wallet address'
                        : 'Show your wallet address'
                    }
                  >
                    <button onClick={() => toggleAddress()}>
                      {showAddress ? ( //TODO move this to profile
                        <div className="flex flex-row items-center">
                          <AiFillUpCircle className="text-casama-blue sm:text-2xl font-medium text-xl mt-3 sm:mt-4 ml-2 sm:ml-4" />
                        </div>
                      ) : (
                        <div className="flex flex-row items-center">
                          <AiOutlineDownCircle className="text-casama-blue sm:text-2xl text-xl font-medium mt-3 sm:mt-4 ml-2 sm:ml-4" />
                        </div>
                      )}
                    </button>
                  </Tooltip>
                </div>
                {showAddress && (
                  <div className="flex flex-row">
                    <div
                      className={
                        showAddress
                          ? 'border-solid text-casama-blue truncate rounded-lg bg-gray-300 p-3 '
                          : 'border-solid text-casama-blue truncate rounded-lg bg-gray-300 p-3 hidden'
                      }
                    >
                      <CopyToClipboard
                        text={user?.address}
                        onCopy={() => handleSuccess('address copied!')}
                      >
                        <span className=" cursor-pointer text-md">
                          <div className="flex flex-row items-center">
                            <div className="truncate ...">{user?.address}</div>
                            <MdContentCopy className="text-gray-500 ml-4 text-2xl sm:text-base" />
                          </div>
                        </span>
                      </CopyToClipboard>
                    </div>
                    <div className="ml-6 -mt-9 sm:-mt-16 border-solid text-casama-blue truncate rounded-lg bg-gray-300 p-3">
                      <div className="hidden sm:flex ">
                        <QrCode
                          text={user?.address || 'https://casama.io'}
                          dark={false}
                          size="3"
                          {...props}
                        />
                      </div>
                      <div className="sm:hidden flex ">
                        <QrCode
                          text={user?.address || 'https://casama.io'}
                          dark={false}
                          size="4"
                          {...props}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-between ">
                <button
                  className="btn-casama w-full mx-1  mt-5 py-4 px-3 text-md cursor-pointer transition-colors sm:w-40 sm:my-0 sm:h-14 sm:py-0 "
                  onClick={handleOpenCloseQuick}
                >
                  Launch Pool
                </button>
                <button
                  className="w-full mx-1 mt-3 sm:mt-4 mb-2 px-3 underline text-casama-blue text-base cursor-pointer  "
                  onClick={handleOpenCloseAdvanced}
                >
                  Advanced Settings
                </button>
              </div>
            </div>

            <div className="sm:flex sm:flex-row">
              <div className="flex flex-col sm:w-1/2 sm:pr-8">
                <Typography className="subheader subheader-sm my-4 sm:my-0 sm:pb-4 font-medium">
                  My Portfolio
                </Typography>
                <BalanceBox className="w-10" {...props} />
              </div>

              <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0  ">
                <div className="flex flex-row justify-between pb-4 ">
                  <Typography className="subheader subheader-sm font-medium">
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
                    {...props}
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
            <PublicPools pools={user.pools} {...props} />
          </div>

          <QuickPoolDialog
            openQuick={openQuick}
            setOpen={handleOpenCloseQuick}
            fetchPools={user.fetchPools}
            {...props}
          />
          <AdvancedPoolDialog
            openAdvanced={openAdvanced}
            setOpen={handleOpenCloseAdvanced}
            fetchPools={user.fetchPools}
            {...props}
          />
        </Container>
      </div>
    </>
  );
}
