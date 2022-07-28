import ProposalCard from './proposalCard';

export default function CurrentVotingsList(props) {
  const { wunderPool, openProposal, setOpenProposal } = props;

  return (
    <div>
      {wunderPool.proposals
        .filter((p) => !(p.executed || p.declined) && !p.executable)
        .sort((one, two) => two.createdAt.sub(two.createdAt))
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
