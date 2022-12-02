import DashboardCompetitionCard from '/components/betting/dashboard/competitionCard';
import CollapsedDashboardCompetitionCard from '/components/betting/dashboard/collapsedCompetitionCard';

export default function BetsRow(props) {
  const {
    user,
    isSortById,
    isHistory,
    isCollapsed,
    setIsCollapsed,
    competition,
  } = props;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // ref.current.scrollIntoView({
    //   behavior: 'smooth',
    // });
  };

  return (
    <div className="flex flex-row justify-between gap-2 w-full">
      {isCollapsed ? (
        <div className="flex flex-row w-full">
          <DashboardCompetitionCard
            key={`dashboard-competition-card-${competition.id}`}
            competition={competition}
            user={user}
            isSortById={isSortById}
            isHistory={isHistory}
            {...props}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-row w-1/10">
            <CollapsedDashboardCompetitionCard
              key={`dashboard-competition-card-${competition.id}`}
              competition={competition}
              user={user}
              isSortById={isSortById}
              isHistory={isHistory}
              toggleCollapse={toggleCollapse}
              {...props}
            />
          </div>
          <div className="flex flex-row w-1/10">
            <CollapsedDashboardCompetitionCard
              key={`dashboard-competition-card-${competition.id}`}
              competition={competition}
              user={user}
              isSortById={isSortById}
              isHistory={isHistory}
              toggleCollapse={toggleCollapse}
              {...props}
            />
          </div>
          <div className="flex flex-row w-1/10">
            <CollapsedDashboardCompetitionCard
              key={`dashboard-competition-card-${competition.id}`}
              competition={competition}
              user={user}
              isSortById={isSortById}
              isHistory={isHistory}
              toggleCollapse={toggleCollapse}
              {...props}
            />
          </div>
        </>
      )}

      {isCollapsed ? (
        <div className="flex flex-row w-1/10">
          <CollapsedDashboardCompetitionCard
            key={`dashboard-competition-card-${competition.id}`}
            competition={competition}
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
            key={`dashboard-competition-card-${competition.id}`}
            competition={competition}
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
