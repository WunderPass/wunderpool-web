import { useEffect, useState } from 'react';
import { Container, Skeleton, Typography } from '@mui/material';
import EventsList from '/components/betting/events/list';
import CustomHeader from '/components/general/utils/customHeader';
import DropDown from '/components/general/utils/dropDown';
import axios from 'axios';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

export default function Betting(props) {
  const { user, bettingService } = props;
  const [showSideBar, setShowSideBar] = useState(true);
  const [eventTypeSort, setEventTypeSort] = useState('All Events');
  const [isSortById, setIsSortById] = useState(false);
  const [sortId, setSortId] = useState(null);
  const { removeQueryParam } = UseAdvancedRouter();
  const router = useRouter();

  const pickFilter = (value) => {
    setEventTypeSort(value);
    setIsSortById(false);
    removeQueryParam('sortId');
  };

  useEffect(() => {
    if (!router.query.sortId) return;
    setSortId(router.query.sortId);
    setEventTypeSort('Event ID: ' + router.query.sortId);
  }, [router.query]);

  return (
    <>
      <CustomHeader />
      <div className="flex sm:flex-row flex-col font-graphik h-full">
        {/* MOBILE */}
        {/* <div className="flex flex-col  sticky top-14 w-full sm:w-auto z-10">
          <div
            className={
              showSideBar
                ? 'flex flex-col sm:hidden h-12 bg-white drop-shadow-lg '
                : ' rounded-b-xl flex flex-col sm:hidden h-12 bg-white drop-shadow-lg '
            }
          >
            <Typography className=" text-xl pt-3 sm:text-3xl font-medium text-gray-500 mx-3">
              Categories
            </Typography>
          </div>{' '}
          <Collapse in={showSideBar}>
            <div className="flex flex-col sm:hidden bg-white rounded-b-xl drop-shadow-lg h-28 z-10 sticky top-14 ">
              <div className="flex flex-row gap-2 overflow-x-scroll ">
                <div className="container-gray-p-0 px-6 py-8">dwad</div>
                <div className="container-gray-p-0 px-6 py-8">daw</div>
                <div className="container-gray-p-0 px-6 py-8">adwa</div>
                <div className="container-gray-p-0 px-6 py-8">daw</div>
                <div className="container-gray-p-0 px-6 py-8">daw</div>
                <div className="container-gray-p-0 px-6 py-8">daw</div>
                <div className="container-gray-p-0 px-6 py-8">daw</div>
                <div className="container-gray-p-0 px-6 py-8">daw</div>
              </div>
            </div>
          </Collapse>
          <button
            className="text-black text-sm font-medium mt-2 z-1 top-16"
            onClick={() => setShowSideBar((val) => !val)}
          >
            <div
              id="advanced"
              className="sm:hidden flex flex-row  items-center justify-end mr-6 text-lg -mt-6 top-16"
            >
              {showSideBar ? (
                <MdOutlineKeyboardArrowUp className="ml-3 text-xl container-round-transparent bg-white z-20 border border-gray-300" />
              ) : (
                <MdOutlineKeyboardArrowDown className="ml-3 text-xl container-round-transparent bg-white z-20 border border-gray-300" />
              )}
            </div>
          </button>
        </div>
        // {/* DESKTOP
        <aside className="hidden sm:block container-white-p-0 h-screen w-1/3 sticky top-16">
          <Typography className=" text-xl pt-16 sm:text-3xl mb-10 font-medium text-gray-500 mx-7">
            Categories
          </Typography>
          <div className="flex flex-col gap-5">
            <div className="container-gray-p-0 mx-6 py-14"></div>
            <div className="container-gray-p-0 mx-6 py-14"></div>
            <div className="container-gray-p-0 mx-6 py-14"></div>
            <div className="container-gray-p-0 mx-6 py-14"></div>
          </div>
        </aside> */}
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
                      Join a betting game
                    </Typography>
                    <DropDown
                      list={[
                        'All Events',
                        ...bettingService.events.map(
                          (event) => event.competitionName
                        ),
                      ]}
                      value={eventTypeSort}
                      setValue={(item) => pickFilter(item)}
                    />
                  </div>

                  {user.isReady ? (
                    <EventsList
                      className="mx-4"
                      eventTypeSort={eventTypeSort}
                      sortId={sortId}
                      isSortById={isSortById}
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
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
