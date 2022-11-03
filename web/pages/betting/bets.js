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
import axios from 'axios';
import useBettingService from '/hooks/useBettingService';

export default function Bets(props) {
  const { user, handleInfo, handleError } = props;
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeSort, setEventTypeSort] = useState('All Events');
  const [eventListOpen, setEventListOpen] = useState(null);
  const [open, setOpen] = useState(false);
  const bettingService = useBettingService(user.address, handleError);

  const handleMenuClose = () => {
    setOpen(false);
    setEventListOpen(null);
  };

  const determineEventTypes = () => {
    let eventTypes = events.map((event) => event.competitionName);
    let uniqueEventTypes = eventTypes.filter((c, index) => {
      return eventTypes.indexOf(c) === index;
    });
    uniqueEventTypes.unshift('All Events');
    setEventTypes(uniqueEventTypes);
  };

  const getEvents = async () => {
    axios({
      method: 'get',
      url: `/api/betting/events`,
    }).then((res) => {
      setEvents(res.data);
    });
  };

  useEffect(() => {
    getEvents().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    determineEventTypes();
  }, [events]);

  return (
    <>
      <CustomHeader />
      <div className="font-graphik">
        <Container>
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
              <div className="flex flex-col">
                <div className="flex flex-row items-center">
                  <Typography className=" text-3xl mt-5 sm:text-4xl mb-2 font-medium">
                    Betting Dashboard
                  </Typography>
                </div>
              </div>
            </div>

            <div className="sm:flex sm:flex-row ">
              <div className="flex flex-col sm:w-1/2 sm:pr-8 ">
                <div className="flex  items-center h-14 text-2xl sm:text-3xl mb-3   font-medium">
                  Overview
                </div>
                {!loading ? (
                  <BettingBox
                    className="w-10"
                    bettingService={bettingService}
                    eventTypeSort={eventTypeSort}
                    user={user}
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

              <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                <div className="flex flex-row items-center justify-between mb-3 h-14 w-full">
                  <Typography className="text-2xl sm:text-3xl font-medium ">
                    My Bets
                  </Typography>

                  <button
                    className={
                      eventListOpen
                        ? 'container-white-p-0 p-3 border-gray-800 border w-56'
                        : 'container-white-p-0 p-3 border-gray-300 border w-56'
                    }
                    onClick={(e) => setEventListOpen(e.currentTarget)}
                  >
                    <div className="flex flex-row justify-between items-center">
                      <p className="text-gray-800 text-lg font-medium ml-2">
                        {eventTypeSort}
                      </p>
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
                    {eventTypes &&
                      eventTypes.map((eventType, i) => {
                        return (
                          <MenuItemUnstyled
                            className={
                              i == 0
                                ? 'shadow-dropdown-b border-b border-gray-200 hover:border-gray-400 hover:drop-shadow-md mt-1 w-56'
                                : i == eventType.length - 1
                                ? 'shadow-dropdown-t border-t border-gray-200 hover:border-gray-400 hover:drop-shadow-md mb-1 w-56'
                                : 'shadow-dropdown-y border-y border-gray-200 hover:border-gray-400 hover:drop-shadow-md w-56'
                            }
                          >
                            <div className="flex flex-row items-center justify-between w-full">
                              <button
                                onClick={() => setEventTypeSort(eventType)}
                                className="text-gray-800 text-base text-left font-medium w-full p-3 ml-1 mt-1 cursor-pointer"
                              >
                                {eventType}
                              </button>
                            </div>
                          </MenuItemUnstyled>
                        );
                      })}
                  </MenuUnstyled>
                </div>

                {!loading ? (
                  <BetsList
                    className="mx-4"
                    bettingService={bettingService}
                    eventTypeSort={eventTypeSort}
                    user={user}
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
        </Container>
      </div>
    </>
  );
}
