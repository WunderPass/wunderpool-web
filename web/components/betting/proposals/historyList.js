import ProposalCard from './proposalCard';

export default function HistoryList(props) {
  const { wunderPool, openProposal } = props;

  return (
    <div>
      {wunderPool.proposals
        .filter((p) => p.executed || p.declined)
        .sort((one, two) => two.createdAt - one.createdAt)
        .map((proposal) => {
          return (
            <ProposalCard
              key={`proposal-${proposal.id}`}
              proposal={proposal}
              openProposal={openProposal}
              {...props}
            />
          );
        })}
    </div>
  );
}
