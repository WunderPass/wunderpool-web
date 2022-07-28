import ProposalCard from './proposalCard';

export default function HistoryList(props) {
  const { wunderPool, openProposal, setOpenProposal } = props;

  return (
    <div>
      {wunderPool.proposals
        .filter((p) => p.executed || p.declined)
        .sort((one, two) => two.createdAt.sub(one.createdAt))
        .map((proposal) => {
          return (
            <ProposalCard
              key={`proposal-${proposal.id}`}
              proposal={proposal}
              openProposal={openProposal}
              setOpenProposal={setOpenProposal}
              {...props}
            />
          );
        })}
    </div>
  );
}
