import { FaMoneyCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Typography, Skeleton } from '@mui/material';
import Link from 'next/link';
import DashboardCompetitionCard from '/components/betting/dashboard/competitionCard';
import CollapsedDashboardCompetitionCard from '/components/betting/dashboard/collapsedCompetitionCard';
import { useRef } from 'react';

export default function BetsList(props) {
  const { user, bettingService, eventTypeSort, sortId, isSortById, isHistory } =
    props;
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ref = useRef(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    ref.current.scrollIntoView({
      behavior: 'smooth',
    });
  };
  useEffect(() => {
    if (!bettingService.isReady) return;
    setLoading(false);
  }, [bettingService.isReady]);

  return !loading ? (
    isHistory ? (
      bettingService.userHistoryCompetitions.length > 0 ? (
        <div className={'grid grid-cols-1 gap-5 w-full'}>
          {bettingService.userHistoryCompetitions
            .sort(
              //TODO fix this as soon as comp has more then one game //
              (a, b) =>
                new Date(b.games[0]?.event?.startTime || 0) -
                new Date(a.games[0]?.event?.startTime || 0)
            )
            .map((comp, i) => {
              if (isSortById) {
                if (comp.id == sortId) {
                  return (
                    //TODO CHECK

                    <div className="flex flex-row">
                      <DashboardCompetitionCard
                        key={`dashboard-competition-card-${comp.id}`}
                        competition={comp}
                        user={user}
                        isSortById={isSortById}
                        isHistory={isHistory}
                        {...props}
                      />
                    </div>
                  );
                }
              } else if (
                comp.games.find(
                  (g) => g.event.competitionName == eventTypeSort
                ) ||
                eventTypeSort == 'All Events'
              ) {
                return (
                  //TODO CHECK

                  <div className="flex flex-row">
                    <DashboardCompetitionCard
                      key={`dashboard-competition-card-${comp.id}`}
                      competition={comp}
                      user={user}
                      isSortById={isSortById}
                      isHistory={isHistory}
                      {...props}
                    />
                  </div>
                );
              }
            })}
        </div>
      ) : (
        <div className="container-white">
          <div className="flex flex-col items-center ">
            <div className="border-solid text-casama-blue rounded-full bg-casama-extra-light-blue p-5 my-2 mt-6 mb-4">
              <FaMoneyCheck className="text-4xl" />
            </div>
            <div className="my-4 mb-10 text-lg text-center">
              <Typography variant="h7">
                You have no open Bets currently. Go to the betting site to join
                or create new bets.
              </Typography>
            </div>
            <Link href="/betting">
              <button className="btn-casama-white justify-center items-center w-full my-5 py-3.5 px-3 mb-0 text-lg font-semibold ">
                Check possible Bets
              </button>
            </Link>
          </div>
        </div>
      )
    ) : bettingService.userCompetitions.length > 0 ? (
      <div className={'grid grid-cols-1 gap-5 w-full'}>
        {bettingService.userCompetitions
          .sort(
            //TODO fix this as soon as comp has more then one game //
            (a, b) =>
              new Date(a.games[0]?.event?.startTime || 0) -
              new Date(b.games[0]?.event?.startTime || 0)
          )
          .map((comp, i) => {
            if (isSortById) {
              if (comp.id == sortId) {
                return (
                  //TODO CHECK
                  <div className="flex flex-row">
                    <DashboardCompetitionCard
                      key={`dashboard-competition-card-${comp.id}`}
                      competition={comp}
                      user={user}
                      isSortById={isSortById}
                      isHistory={isHistory}
                      {...props}
                    />
                  </div>
                );
              }
            } else if (
              comp.games.find(
                (g) => g.event.competitionName == eventTypeSort
              ) ||
              eventTypeSort == 'All Events'
            ) {
              return (
                <div
                  ref={ref}
                  className="flex flex-row justify-between gap-2  w-full"
                >
                  {isCollapsed ? (
                    <div className="flex flex-row w-full">
                      <DashboardCompetitionCard
                        key={`dashboard-competition-card-${comp.id}`}
                        competition={comp}
                        user={user}
                        isSortById={isSortById}
                        isHistory={isHistory}
                        {...props}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row w-1/10">
                      <CollapsedDashboardCompetitionCard
                        key={`dashboard-competition-card-${comp.id}`}
                        competition={comp}
                        user={user}
                        isSortById={isSortById}
                        isHistory={isHistory}
                        toggleCollapse={toggleCollapse}
                        {...props}
                      />
                    </div>
                  )}

                  {isCollapsed ? (
                    <div className="flex flex-row w-1/10">
                      <CollapsedDashboardCompetitionCard
                        key={`dashboard-competition-card-${comp.id}`}
                        competition={comp}
                        user={user}
                        isSortById={isSortById}
                        isHistory={isHistory}
                        toggleCollapse={toggleCollapse}
                        {...props}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row w-full">
                      <DashboardCompetitionCard
                        key={`dashboard-competition-card-${comp.id}`}
                        competition={comp}
                        user={user}
                        isSortById={isSortById}
                        isHistory={isHistory}
                        {...props}
                      />
                    </div>
                  )}
                </div>
              );
            }
          })}
      </div>
    ) : (
      <div className="container-white">
        <div className="flex flex-col items-center ">
          <div className="border-solid text-casama-blue rounded-full bg-casama-extra-light-blue p-5 my-2 mt-6 mb-4">
            <FaMoneyCheck className="text-4xl" />
          </div>
          <div className="my-4 mb-10 text-lg text-center">
            <Typography variant="h7">
              You have no open Bets currently. Go to the betting site to join or
              create new bets.
            </Typography>
          </div>
          <Link href="/betting">
            <button className="btn-casama-white justify-center items-center w-full my-5 py-3.5 px-3 mb-0 text-lg font-semibold ">
              Check possible Bets
            </button>
          </Link>
        </div>
      </div>
    )
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}
