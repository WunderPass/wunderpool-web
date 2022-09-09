import ProposalCard from './proposalCard';

export default function CurrentVotingsList(props) {
  const { wunderPool, openProposal } = props;

  return (
    <div>
      {wunderPool.proposals
        .filter(
          (p) => !(p.executed || p.declined || p.executable) && !p.hasVoted
        )
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
      {wunderPool.proposals
        .filter(
          (p) => !(p.executed || p.declined || p.executable) && p.hasVoted
        )
        .sort((one, two) => new Date(two.createdAt) - new Date(one.createdAt))
        .map((proposal) => {
          {
            console.log('Proposal:', proposal);
          }
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
