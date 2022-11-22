import CustomHeader from '/components/general/utils/customHeader';
import BettingBox from '/components/betting/dashboard/bettingBox';
import { useEffect, useState } from 'react';
import { Container, Skeleton, Typography, Tab, Tabs, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import BetsList from '/components/betting/dashboard/betsList';
import DropDown from '/components/general/utils/dropDown';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

export default function Bets(props) {
  const { user, bettingService, handleInfo, handleError } = props;
  const [loading, setLoading] = useState(true);
  const [eventTypeSort, setEventTypeSort] = useState('All Events');
  const [isSortById, setIsSortById] = useState(false);
  const [sortId, setSortId] = useState(null);
  const { removeQueryParam } = UseAdvancedRouter();
  const [isHistory, setIsHistory] = useState(false);
  const [value, setValue] = useState(0);
  const router = useRouter();

  const pickFilter = (value) => {
    setEventTypeSort(value);
    setIsSortById(false);
    removeQueryParam('sortId');
  };

  const toggleHistory = () => {
    setIsHistory(!isHistory);
  };

  const handleChange = (_, newValue) => {
    toggleHistory();
    setValue(newValue);
  };

  useEffect(() => {
    if (!router.query.sortId) return;
    setSortId(router.query.sortId);
    setIsSortById(true);
    setEventTypeSort(router.query.sortId);
  }, [router.query]);

  useEffect(() => {
    setLoading(!bettingService.isReady);
  }, [bettingService.isReady]);

  return (
    <>
      <CustomHeader />
      <div className="font-graphik">
        <Container>
          <div className="flex flex-col w-full justify-start">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-4">
              <div className="flex flex-col">
                <div className="flex flex-row items-center">
                  <Typography className=" text-3xl mt-5 sm:text-4xl mb-2 font-medium">
                    Betting Dashboard
                  </Typography>
                </div>
              </div>
            </div>

            <div className="sm:flex sm:flex-row ">
              <div className="w-full pr-1 mb-2 mt-8 sm:mb-0 sm:mt-0">
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    width: '100%',
                  }}
                >
                  <StyledTabs
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                  >
                    <StyledTab label="My Bets" />
                    <StyledTab label="History" />
                  </StyledTabs>
                </Box>

                <div className="flex flex-row items-end justify-end mb-2 mt-1 w-full"></div>
                <div className="flex items-end justify-end mb-2">
                  <DropDown
                    list={
                      isHistory
                        ? [
                            'All Events',
                            ...bettingService.userHistoryCompetitions.map(
                              (comp) => comp.games[0].event.competitionName
                            ),
                          ]
                        : [
                            'All Events',
                            ...bettingService.events.map(
                              (event) => event.competitionName
                            ),
                          ]
                    }
                    value={eventTypeSort}
                    setValue={(item) => pickFilter(item)}
                  />
                </div>
                <div className="flex md:flex-row flex-col md:gap-5 gap-3">
                  <div className="h-auto md:w-96 w-full md ">
                    {!loading ? (
                      <BettingBox
                        className="w-10"
                        bettingService={bettingService}
                        eventTypeSort={eventTypeSort}
                        user={user}
                        isHistory={isHistory}
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
                  {!loading ? (
                    <BetsList
                      className="mx-4"
                      bettingService={bettingService}
                      eventTypeSort={eventTypeSort}
                      sortId={sortId}
                      isSortById={isSortById}
                      user={user}
                      isHistory={isHistory}
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

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.pxToRem(28),
    marginRight: theme.spacing(1),
    color: '#000000',
    '&.Mui-selected': {
      color: '#462cf1',
    },
    '&.Mui-focusVisible': {
      backgroundColor: '#FFFFFF',
    },
  })
);

const StyledTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 4,
  },
  '& .MuiTabs-indicatorSpan': {
    width: '100%',
    backgroundColor: '#635ee7',
  },
});
