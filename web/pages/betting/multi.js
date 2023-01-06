import { useEffect, useState } from 'react';
import { Container, Skeleton, Typography } from '@mui/material';
import MultiList from '/components/betting/multi/list';
import CustomHeader from '/components/general/utils/customHeader';
import DropDown from '/components/general/utils/dropDown';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

export default function Betting(props) {
  const { bettingService } = props;
  const [showSideBar, setShowSideBar] = useState(true);
  const [eventTypeSort, setEventTypeSort] = useState('All Events');
  const [format, setFormat] = useState('All Formats');
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
    setIsSortById(true);
    setEventTypeSort('Event ID: ' + router.query.sortId);
  }, [router.query]);

  return (
    <>
      <CustomHeader />
      <div className="flex sm:flex-row flex-col font-graphik h-full">
        <Container>
          <div className="flex flex-row w-full justify-start ">
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center ">
                    <Typography className=" text-2xl mt-5 sm:text-4xl mb-2 font-medium">
                      Multi - Competitions
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="sm:flex sm:flex-row">
                <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                  <div className="flex flex-row items-center justify-between mb-3 h-14 w-full">
                    <Typography className="text-xl sm:text-3xl font-medium ">
                      Join or Create a Multi Competition
                    </Typography>
                    {/* <div className="flex gap-2">
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
                    </div> */}
                  </div>

                  {bettingService.isReady ? (
                    <MultiList
                      className="mx-4"
                      eventTypeSort={eventTypeSort}
                      sortId={sortId}
                      isSortById={isSortById}
                      format={format}
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
