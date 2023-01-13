import { FaMoneyCheck } from 'react-icons/fa';
import { useState, useEffect, useMemo } from 'react';
import { Typography, Skeleton } from '@mui/material';
import Link from 'next/link';
import DashboardCompetitionCard from '/components/betting/dashboard/competitionCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import MultiCompetitionCard from '/components/betting/dashboard/multiCompetitionCard';

function sortByDate(competitions, desc = false) {
  return competitions.sort((first, second) => {
    const firstDate = new Date(first.games[0]?.event?.startTime || 0);
    const secondDate = new Date(second.games[0]?.event?.startTime || 0);
    return desc ? firstDate - secondDate : secondDate - firstDate;
  });
}

function sortCompetition(
  competitions,
  isSortById,
  sortId,
  eventTypeSort,
  desc = false
) {
  if (isSortById && sortId) {
    return competitions.filter((comp) => comp.id == sortId);
  } else if (eventTypeSort && eventTypeSort != 'All Events') {
    return sortByDate(
      competitions.filter((comp) =>
        comp.games.find((g) => g.event.competitionName == eventTypeSort)
      ),
      desc
    );
  }
  return sortByDate(competitions, desc);
}

export default function BetsList(props) {
  const { user, bettingService, eventTypeSort, sortId, isSortById, isHistory } =
    props;
  const [visibleCompetitionLength, setVisibleCompetitionLength] = useState(10);

  const allCompetitions = useMemo(() => {
    return isHistory
      ? sortCompetition(
          bettingService.userHistoryCompetitions,
          isSortById,
          sortId,
          eventTypeSort
        )
      : sortCompetition(
          bettingService.userCompetitions, //TODO TESTING Change this back to userCompetitions
          isSortById,
          sortId,
          eventTypeSort,
          true
        );
  }, [
    isHistory,
    isSortById,
    sortId,
    eventTypeSort,
    bettingService.userHistoryCompetitions?.length,
    bettingService.userCompetitions?.length,
  ]);

  const visibleCompetitions = allCompetitions.slice(
    0,
    visibleCompetitionLength
  );

  useEffect(() => {
    setVisibleCompetitionLength(10);
  }, [isHistory]);

  return bettingService.isReady ? (
    allCompetitions.length > 0 ? (
      <InfiniteScroll
        className="grid grid-cols-1 gap-5 w-full"
        dataLength={visibleCompetitions.length}
        next={() => setVisibleCompetitionLength((num) => num + 10)}
        hasMore={visibleCompetitions.length < allCompetitions.length}
      >
        {visibleCompetitions.map((comp, i) => {
          //If competitions has more than 1 game other view
          //create other view first

          return comp.games.length > 1 ? (
            <MultiCompetitionCard
              key={`dashboard-competition-card-${comp.id}`}
              competition={comp}
              user={user}
              isSortById={isSortById}
              isHistory={isHistory}
              {...props}
            />
          ) : (
            <DashboardCompetitionCard
              key={`dashboard-competition-card-${comp.id}`}
              competition={comp}
              user={user}
              isSortById={isSortById}
              isHistory={isHistory}
              {...props}
            />
          );
        })}
      </InfiniteScroll>
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
