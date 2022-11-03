import { useRouter } from 'next/router';
import CustomHeader from '/components/general/utils/customHeader';
import BettingBox from '/components/betting/pool/bettingBox';
import { useEffect, useState } from 'react';
import { Container, Skeleton, Typography } from '@mui/material';
import BetsList from '/components/betting/dashboard/betsList';
import axios from 'axios';
import DropDown from '/components/general/utils/dropDown';

export default function Bets(props) {
  const { user, bettingService, handleInfo, handleError } = props;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventTypeSort, setEventTypeSort] = useState('All Events');

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

                  <DropDown
                    list={eventTypes}
                    value={eventTypeSort}
                    setValue={setEventTypeSort}
                  />
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
