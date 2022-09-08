import ProposalCard from './proposalCard';

export default function ExecutableList(props) {
  const { wunderPool, openProposal } = props;

  return (
    <div>
      {wunderPool.proposals
        .filter((p) => p.executable)
        .sort((one, two) => new Date(two.createdAt) - new Date(one.createdAt))
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
