import ProposalCard from './proposalCard';
import { useState, useEffect } from 'react';

export default function CurrentVotingsList(props) {
  const { wunderPool, openProposal, setOpenProposal } = props;

  return (
    <div>
      {wunderPool.proposals
        .filter(
          (p) => !(p.executed || p.declined || p.executable) && !p.hasVoted
        )
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
      {wunderPool.proposals
        .filter(
          (p) => !(p.executed || p.declined || p.executable) && p.hasVoted
        )
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
