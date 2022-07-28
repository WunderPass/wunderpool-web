import ProposalCard from './proposalCard';
import { useState, useEffect } from 'react';

export default function CurrentVotingsList(props) {
  const { wunderPool, openProposal, setOpenProposal } = props;
  const [unvotedProposalsList, setUnvotedProposalsList] = useState([]);
  const [votedProposalsList, setVotedProposalsList] = useState([]);

  const createLists = () => {
    wunderPool.proposals
      .filter((p) => !(p.executed || p.declined || p.executable))
      .sort((one, two) => two.createdAt.sub(one.createdAt))
      .map((proposal) => {
        wunderPool.userHasVoted(proposal.id).then((value) => {
          if (value == 0) {
            setUnvotedProposalsList((oldArray) => [...oldArray, proposal]);
          } else {
            setVotedProposalsList((oldArray) => [...oldArray, proposal]);
          }
        });
      });
  };

  useEffect(() => {
    createLists();
  }, []);

  return (
    <div>
      {unvotedProposalsList.map((proposal) => {
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
      {votedProposalsList.map((proposal) => {
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
