import axios from 'axios';
import { useEffect, useState } from 'react';
import { cacheItemDB, getCachedItemDB } from '../services/caching';
import { toEthString, currency, polyValueToUsd } from '../services/formatter';
import { initPoolSocket } from '/services/contract/init';

export default function usePoolListener(handleInfo) {
  const [poolAddress, setPoolAddress] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [votedEvent, setVotedEvent] = useState(null);
  const [newProposalEvent, setNewProposalEvent] = useState(null);
  const [newMemberEvent, setNewMemberEvent] = useState(null);
  const [tokenAddedEvent, setTokenAddedEvent] = useState(null);
  const [proposalExecutedEvent, setProposalExecutedEvent] = useState(null);

  const reset = () => {
    setVotedEvent(null);
    setNewProposalEvent(null);
    setNewMemberEvent(null);
    setTokenAddedEvent(null);
    setProposalExecutedEvent(null);
  };

  const setupPoolListener = (address, user = null) => {
    setPoolAddress(address);
    setUserAddress(user);
  };

  const resolveUser = (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user =
          (await getCachedItemDB(address)) ||
          (await cacheItemDB(
            address,
            (
              await axios({
                url: '/api/proxy/users/find',
                params: { address: address },
              })
            ).data,
            600
          ));
        resolve(user?.wunderId || null);
      } catch (error) {
        resolve(null);
      }
    });
  };

  const notifyIfRelevant = (msg, creator) => {
    if (userAddress && userAddress.toLowerCase() == creator.toLowerCase())
      return;
    handleInfo(msg);
  };

  const startListener = async () => {
    const [wunderPool] = initPoolSocket(poolAddress);

    wunderPool.removeAllListeners();

    wunderPool.on('NewProposal', async (id, creator, title) => {
      console.log('NewProposal:', id, creator, title);
      const wunderId = await resolveUser(creator);
      notifyIfRelevant(
        `New Proposal: ${title}${wunderId ? ' from User ' + wunderId : ''}`,
        creator
      );
      setNewProposalEvent({ id: id.toNumber(), creator });
    });

    wunderPool.on('NewMember', async (address, stake) => {
      console.log('NewMember:', address, stake);
      const wunderId = await resolveUser(address);
      handleInfo(
        `${wunderId || address} joined the Pool with ${currency(
          polyValueToUsd(stake)
        )}`
      );
      setNewMemberEvent({ address, stake });
    });

    wunderPool.on('Voted', async (proposalId, voter, mode) => {
      const modeLookup = ['NONE', 'YES', 'NO'];
      const wunderId = await resolveUser(voter);
      notifyIfRelevant(
        `${wunderId || voter} voted ${
          modeLookup[mode.toNumber()]
        } for Proposal #${proposalId.toNumber()}`,
        voter
      );
      setVotedEvent({ id: proposalId.toNumber(), voter });
    });

    wunderPool.on('ProposalExecuted', async (proposalId, executor, result) => {
      console.log('ProposalExecuted:', proposalId, executor, result);
      const wunderId = await resolveUser(executor);
      notifyIfRelevant(
        `Proposal #${proposalId.toNumber()} was executed by ${
          wunderId || executor
        }`,
        executor
      );
      setProposalExecutedEvent({ id: proposalId.toNumber(), executor });
    });

    wunderPool.on('TokenAdded', async (tokenAddress, isERC721, tokenId) => {
      console.log('TokenAdded:', tokenAddress, isERC721, tokenId);
      handleInfo(
        `New ${isERC721 ? 'NFT' : 'Token'} Added to the Pool: ${tokenAddress}`
      );
      setTokenAddedEvent({ tokenAddress, nft: isERC721 });
    });

    wunderPool.on('MaticWithdrawed', async (receiver, amount) => {
      console.log('MaticWithdrawed:', receiver, amount);
      handleInfo(`${toEthString(amount, 18)} MATIC sent to ${receiver}`);
    });

    wunderPool.on(
      'TokensWithdrawed',
      async (tokenAddress, receiver, amount) => {
        console.log('TokensWithdrawed:', tokenAddress, receiver, amount);
        handleInfo(`Token ${tokenAddress} sent to ${receiver}`);
      }
    );
  };

  useEffect(() => {
    if (poolAddress && poolAddress.length == 42) {
      startListener();
    }
  }, [poolAddress]);

  return [
    setupPoolListener,
    votedEvent,
    newProposalEvent,
    newMemberEvent,
    tokenAddedEvent,
    proposalExecutedEvent,
    reset,
  ];
}
