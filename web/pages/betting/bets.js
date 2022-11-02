import { useRouter } from 'next/router';
import CustomHeader from '/components/general/utils/customHeader';
import BettingBox from '/components/betting/pool/bettingBox';
import { useEffect, useState } from 'react';
import {
  Container,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import AdvancedPoolDialog from '/components/betting/dialogs/advancedPool/dialog';
import QuickPoolDialog from '/components/betting/dialogs/quickPool/dialog';
import BetsList from '/components/betting/dashboard/betsList';
import { MdKeyboardArrowDown } from 'react-icons/md';
import MenuUnstyled from '@mui/base/MenuUnstyled';
import MenuItemUnstyled from '@mui/base/MenuItemUnstyled';

export default function Pool(props) {
  const router = useRouter();
  const { user, handleInfo, handleError } = props;
  const [eventListOpen, setEventListOpen] = useState(null);
  const [open, setOpen] = useState(false);

  const handleMenuClose = () => {
    setOpen(false);
    setEventListOpen(null);
  };

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
                    Betting Dashboard
                  </Typography>
                </div>
              </div>
            </div>

            <div className="sm:flex sm:flex-row">
              <div className="flex flex-col sm:w-1/2 sm:pr-8">
                <Typography className="text-xl sm:text-3xl my-4 sm:my-0 sm:pb-4 font-medium">
                  Category
                </Typography>
                <BettingBox className="w-10" {...props} />
              </div>

              <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                <div className="flex flex-row items-center justify-between mb-4 w-full">
                  <Typography className="text-xl sm:text-3xl font-medium ">
                    My Bets
                  </Typography>
                  <button
                    className="container-white-p-0 p-3 text-lg font-medium border-gray-800 border "
                    onClick={(e) => setEventListOpen(e.currentTarget)}
                  >
                    <div className="flex flex-row justify-center items-center">
                      <p className="text-gray-800">All Events</p>
                      <MdKeyboardArrowDown className="text-2xl text-gray-800" />
                    </div>
                  </button>
                  <MenuUnstyled
                    className="container-white-p-0 rounded-full m-2 drop-shadow-around"
                    open={Boolean(eventListOpen)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    anchorEl={eventListOpen}
                  >
                    {user.pools.length > 0 &&
                      user.pools.map((pool, i) => {
                        return (
                          <MenuItemUnstyled
                            className={
                              i == 0
                                ? 'shadow-dropdown-b border-b border-gray-200 hover:border-gray-400 hover:drop-shadow-md mt-1'
                                : i == user.pools.length - 1
                                ? 'shadow-dropdown-t border-t border-gray-200 hover:border-gray-400 hover:drop-shadow-md mb-1'
                                : 'shadow-dropdown-y border-y border-gray-200 hover:border-gray-400 hover:drop-shadow-md'
                            }
                          >
                            <div className="flex flex-row items-center justify-between w-full">
                              <div className="text-lg text-gray-800 w-full p-2 cursor-pointer">
                                {pool.name}
                              </div>
                            </div>
                          </MenuItemUnstyled>
                        );
                      })}
                  </MenuUnstyled>
                </div>

                {user.isReady ? (
                  <BetsList className="mx-4" user={user} {...props} />
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
        </Container>
      </div>
    </>
  );
}
