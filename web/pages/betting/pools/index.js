import BettingBox from '/components/betting/pool/bettingBox';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Pagination,
  Skeleton,
  Typography,
  Tooltip,
} from '@mui/material';
import AdvancedPoolDialog from '/components/betting/dialogs/advancedPool/dialog';
import QuickPoolDialog from '/components/betting/dialogs/quickPool/dialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { AiFillUpCircle } from 'react-icons/ai';
import { AiOutlineDownCircle } from 'react-icons/ai';
import BetsList from '/components/betting/dashboard/betsList';
import CustomHeader from '/components/general/utils/customHeader';
import PublicPools from '/components/betting/dashboard/publicPools';
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
      <div className="flex flex-row font-graphik h-full">
        <aside class="container-white-p-0 h-screen w-1/3  sticky top-16">
          <Typography className=" text-xl pt-16 sm:text-3xl mb-10 font-medium text-gray-500 ml-7">
            Categories
          </Typography>
          <div className="flex flex-col gap-5">
            <div className="container-gray-p-0 mx-6 py-14"></div>
            <div className="container-gray-p-0 mx-6 py-14"></div>
            <div className="container-gray-p-0 mx-6 py-14"></div>
            <div className="container-gray-p-0 mx-6 py-14"></div>
          </div>
        </aside>
        <Container>
          <div className="flex flex-row w-full justify-start ">
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center ">
                    <Typography className=" text-2xl mt-5 sm:text-4xl mb-2 font-medium">
                      Betting
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="sm:flex sm:flex-row">
                <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                  <div className="flex flex-row items-center justify-between mb-3 h-14 w-full">
                    <Typography className="text-xl sm:text-3xl font-medium ">
                      Enter a new betting game
                    </Typography>
                  </div>

                  {user.isReady ? (
                    <BetsList
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
            </div>{' '}
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
