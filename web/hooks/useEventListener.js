import axios from 'axios';
import { useEffect, useState } from 'react';
import { cacheItemDB, getCachedItemDB } from '/services/caching';
import { currency } from '/services/formatter';

export default function useEventListener(handleInfo) {
  const [eventSource, setEventSource] = useState(null);
  const [userPools, setUserPools] = useState([]);
  const [poolAddress, setPoolAddress] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [votedEvent, setVotedEvent] = useState(null);
  const [newPoolEvent, setNewPoolEvent] = useState(null);
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

  const updateListener = (userPools, poolAddress, userAddress = null) => {
    if (eventSource) eventSource.close();
    setEventSource(null);
    setUserPools(userPools);
    setPoolAddress(poolAddress);
    setUserAddress(userAddress);
  };

  // helper functions
  const compareAddr = (first, second) => {
    return first?.toLowerCase() == second?.toLowerCase();
  };

  const truncateAddr = (addr) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const relevantForPool = (event) => {
    return compareAddr(JSON.parse(event.data)?.pool_address, poolAddress);
  };

  const relevantForUser = (event) => {
    return userPools.find((pool) =>
      compareAddr(JSON.parse(event.data)?.pool_address, pool.address)
    );
  };

  const poolLink = (addr) => {
    return `/investing/pools/${addr}`;
  };

  const resolveUser = (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user =
          (await getCachedItemDB(address.toLowerCase())) ||
          (await cacheItemDB(
            address.toLowerCase(),
            (
              await axios({
                method: 'POST',
                url: '/api/users/find',
                data: { address: address.toLowerCase() },
              })
            ).data,
            600
          ));
        resolve(user?.handle || null);
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
    if (compareAddr(userAddress, creator)) return;
    handleInfo(msg);
  };

  // Event Handlers
  const handlePoolCreated = async (event) => {
    const data = JSON.parse(event.data);
    setNewPoolEvent({
      address: data.pool_address,
      name: data.entity.pool_name,
      hash: data.transaction_hash,
    });
  };
  const handleUserJoined = async (event) => {
    const user = JSON.parse(event.data)?.entity;
    if (relevantForPool(event)) {
      const userName = await resolveUser(user.members_address);
      notifyIfRelevant(
        `${
          userName || truncateAddr(user.members_address)
        } joined the Pool with ${currency(user.invest)}`,
        user.members_address
      );
      setNewMemberEvent(user);
    } else {
      const pool = relevantForUser(event);
      if (!pool) return;
      const userName = await resolveUser(user.members_address);
      handleInfo(
        `${userName || truncateAddr(user.members_address)} joined the Pool "${
          pool.name
        }" with ${currency(user.invest)}`,
        { href: poolLink(pool.address), btn: 'Show' }
      );
    }
  };

  const handleUserInvited = (event) => {
    console.log('USER_INVITED', JSON.parse(event.data));
    if (!relevantForPool(event)) return;
  };

  const handleTransactionReverted = (event) => {
    console.log('TRANSACTION_REVERTED', JSON.parse(event.data));
  };

  const handleTransactionFailed = (event) => {
    console.log('TRANSACTION_FAILED', JSON.parse(event.data));
  };

  const handleProposalCreated = (event) => {
    const proposal = JSON.parse(event.data)?.entity;
    if (relevantForPool(event)) {
      handleInfo(`New Proposal: ${proposal.title}`);
      setNewProposalEvent(proposal);
    } else {
      const pool = relevantForUser(event);
      if (!pool) return;
      handleInfo(`${pool.name} - New Proposal: ${proposal.title}`, {
        href: `${poolLink(pool.address)}?tab=1`,
        btn: 'Show',
      });
    }
  };

  const handleProposalVoted = (event) => {
    const proposal = JSON.parse(event.data)?.entity;
    if (relevantForPool(event)) {
      handleInfo(`New Vote for Proposal "${proposal.title}"`);
      setVotedEvent(proposal);
    } else {
      const pool = relevantForUser(event);
      if (!pool) return;
      handleInfo(`${pool.name} - New Vote for Proposal: ${proposal.title}`, {
        href: `${poolLink(pool.address)}?tab=1`,
        btn: 'Show',
      });
    }
  };

  const handleProposalExecuted = (event) => {
    const proposal = JSON.parse(event.data)?.entity;
    if (relevantForPool(event)) {
      handleInfo(`Proposal "${proposal.title}" Executed`);
      setProposalExecutedEvent(proposal);
    } else {
      const pool = relevantForUser(event);
      if (!pool) return;
      handleInfo(`${pool.name} - Proposal: "${proposal.title}" Executed`, {
        href: poolLink(pool.address),
        btn: 'Show',
      });
    }
  };

  const startListener = async () => {
    if (eventSource) return;
    const es = new EventSource(`${process.env.SOCKET_URL}/subscribe`);

    es.addEventListener('POOL_CREATED', handlePoolCreated);
    es.addEventListener('USER_JOINED', handleUserJoined);
    es.addEventListener('USER_INVITED', handleUserInvited);
    es.addEventListener('TRANSACTION_REVERTED', handleTransactionReverted);
    es.addEventListener('TRANSACTION_FAILED', handleTransactionFailed);
    es.addEventListener('PROPOSAL_CREATED', handleProposalCreated);
    es.addEventListener('PROPOSAL_VOTED', handleProposalVoted);
    es.addEventListener('PROPOSAL_EXECUTED', handleProposalExecuted);

    setEventSource(es);
  };

  useEffect(() => {
    startListener();
    window.addEventListener('beforeunload', (e) => {
      if (eventSource) eventSource.close();
    });

    return () => {
      if (eventSource) eventSource.close();
      setEventSource(null);
    };
  }, [userPools, poolAddress, userAddress]);

  return {
    updateListener,
    newPoolEvent,
    newMemberEvent,
    newProposalEvent,
    votedEvent,
    proposalExecutedEvent,
    tokenAddedEvent,
    resetEvents: reset,
  };
}

// import axios from 'axios';
// import { ethers } from 'ethers';
// import { useEffect, useState } from 'react';
// import { cacheItemDB, getCachedItemDB } from '/services/caching';
// import { toEthString, currency, polyValueToUsd } from '/services/formatter';
// import { initPoolSocket } from '/services/contract/init';

// export default function useEventListener(handleInfo) {
//   const [poolAddress, setPoolAddress] = useState(null);
//   const [userAddress, setUserAddress] = useState(null);
//   const [votedEvent, setVotedEvent] = useState(null);
//   const [newProposalEvent, setNewProposalEvent] = useState(null);
//   const [newMemberEvent, setNewMemberEvent] = useState(null);
//   const [tokenAddedEvent, setTokenAddedEvent] = useState(null);
//   const [proposalExecutedEvent, setProposalExecutedEvent] = useState(null);

//   const reset = () => {
//     setVotedEvent(null);
//     setNewProposalEvent(null);
//     setNewMemberEvent(null);
//     setTokenAddedEvent(null);
//     setProposalExecutedEvent(null);
//   };

//   const setupPoolListener = (address, user = null) => {
//     setPoolAddress(address);
//     setUserAddress(user);
//   };

//   const resolveUser = (address) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const user =
//           (await getCachedItemDB(address.toLowerCase())) ||
//           (await cacheItemDB(
//             address.toLowerCase(),
//             (
//               await axios({
//                 method: 'POST',
//                 url: '/api/users/find',
//                 data: { address: address.toLowerCase() },
//               })
//             ).data,
//             600
//           ));
//         resolve(user?.wunder_id || null);
//       } catch (error) {
//         resolve(null);
//       }
//     });
//   };

//   const resolveToken = (address) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const token =
//           (await getCachedItemDB(address)) ||
//           (await cacheItemDB(
//             address,
//             (
//               await axios({
//                 url: `/api/tokens/show`,
//                 params: { address },
//               })
//             ).data,
//             600
//           ));
//         resolve(token || {});
//       } catch (error) {
//         resolve({});
//       }
//     });
//   };

//   const notifyIfRelevant = (msg, creator) => {
//     if (userAddress && userAddress.toLowerCase() == creator.toLowerCase())
//       return;
//     handleInfo(msg);
//   };

//   const startListener = async () => {
//     const [wunderPool] = initPoolSocket(poolAddress);

//     wunderPool.removeAllListeners();

//     wunderPool.on('NewProposal', async (id, creator, title) => {
//       const wunderId = await resolveUser(creator);
//       notifyIfRelevant(
//         `New Proposal: ${title}${wunderId ? ' from User ' + wunderId : ''}`,
//         creator
//       );
//       setNewProposalEvent({ id: id.toNumber(), creator });
//     });

//     wunderPool.on('NewMember', async (address, stake) => {
//       const wunderId = await resolveUser(address);
//       handleInfo(
//         `${wunderId || address} joined the Pool with ${currency(
//           polyValueToUsd(stake)
//         )}`
//       );
//       setNewMemberEvent({ address, stake });
//     });

//     wunderPool.on('Voted', async (proposalId, voter, mode) => {
//       const modeLookup = ['NONE', 'YES', 'NO'];
//       const wunderId = await resolveUser(voter);
//       notifyIfRelevant(
//         `${wunderId || voter} voted ${
//           modeLookup[mode.toNumber()]
//         } for Proposal #${proposalId.toNumber()}`,
//         voter
//       );
//       setVotedEvent({ id: proposalId.toNumber(), voter });
//     });

//     wunderPool.on('ProposalExecuted', async (proposalId, executor, result) => {
//       const wunderId = await resolveUser(executor);
//       notifyIfRelevant(
//         `Proposal #${proposalId.toNumber()} was executed${
//           wunderId ? ` by ${wunderId}` : ''
//         }`,
//         executor
//       );
//       setProposalExecutedEvent({ id: proposalId.toNumber(), executor });
//     });

//     wunderPool.on('TokenAdded', async (tokenAddress, isERC721, tokenId) => {
//       const { name } = await resolveToken(tokenAddress);
//       handleInfo(
//         `New ${isERC721 ? 'NFT' : 'Token'} Added to the Pool: ${
//           name || tokenAddress
//         }`
//       );
//       setTokenAddedEvent({ tokenAddress, nft: isERC721 });
//     });

//     wunderPool.on('MaticWithdrawed', async (receiver, amount) => {
//       handleInfo(`${toEthString(amount, 18)} MATIC sent to ${receiver}`);
//     });

//     wunderPool.on(
//       'TokensWithdrawed',
//       async (tokenAddress, receiver, amount) => {
//         const wunderId = await resolveUser(receiver);
//         const {
//           name,
//           price = 0,
//           decimals = 0,
//         } = await resolveToken(tokenAddress);
//         const usdValue =
//           amount
//             .mul(price)
//             .div(ethers.BigNumber.from(10).pow(decimals + 4))
//             .toNumber() / 100;
//         if (usdValue > 0) {
//           handleInfo(
//             `${currency(usdValue)} of ${name || tokenAddress} sent to ${
//               wunderId || receiver
//             }`
//           );
//         } else {
//           handleInfo(
//             `Token ${name || tokenAddress} sent to ${wunderId || receiver}`
//           );
//         }
//       }
//     );
//   };

//   useEffect(() => {
//     if (poolAddress && poolAddress.length == 42) {
//       startListener();
//     }
//   }, [poolAddress]);

//   return [
//     setupPoolListener,
//     votedEvent,
//     newProposalEvent,
//     newMemberEvent,
//     tokenAddedEvent,
//     proposalExecutedEvent,
//     reset,
//   ];
// }
