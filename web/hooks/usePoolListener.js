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
                params: { address },
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

  const resolveToken = (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const token =
          (await getCachedItemDB(address)) ||
          (await cacheItemDB(
            address,
            (
              await axios({
                url: `/api/tokens/show`,
                params: { address },
              })
            ).data,
            600
          ));
        resolve(token || {});
      } catch (error) {
        resolve({});
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
      const wunderId = await resolveUser(creator);
      notifyIfRelevant(
        `New Proposal: ${title}${wunderId ? ' from User ' + wunderId : ''}`,
        creator
      );
      setNewProposalEvent({ id: id.toNumber(), creator });
    });

    wunderPool.on('NewMember', async (address, stake) => {
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
      const { name } = await resolveToken(tokenAddress);
      handleInfo(
        `New ${isERC721 ? 'NFT' : 'Token'} Added to the Pool: ${
          name || tokenAddress
        }`
      );
      setTokenAddedEvent({ tokenAddress, nft: isERC721 });
    });

    wunderPool.on('MaticWithdrawed', async (receiver, amount) => {
      handleInfo(`${toEthString(amount, 18)} MATIC sent to ${receiver}`);
    });

    wunderPool.on(
      'TokensWithdrawed',
      async (tokenAddress, receiver, amount) => {
        const wunderId = await resolveUser(receiver);
        const {
          name,
          price = 0,
          decimals = 0,
        } = await resolveToken(tokenAddress);
        const usdValue = amount
          .mul(price)
          .div(10 ** (decimals + 6))
          .toNumber();
        if (usdValue > 0) {
          handleInfo(
            `${currency(usdValue)} of ${name || tokenAddress} sent to ${
              wunderId || receiver
            }`
          );
        } else {
          handleInfo(
            `Token ${name || tokenAddress} sent to ${wunderId || receiver}`
          );
        }
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
