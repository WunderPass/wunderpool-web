import axios from 'axios';
import { postAndWaitForTransaction } from '../../backendApi';
import { usdc } from '../../formatter';
import { versionLookup } from '../init';
import { joinPool } from '../pools';
import { approveUSDC } from '../token';
import * as ga from '/lib/google-analytics';

export async function createCompetition({
  name,
  creator,
  eventIds,
  invitations,
  payoutRule,
  stake,
  isPublic,
  version = null,
}) {
  try {
    await approveUSDC(
      creator,
      '0x8c3B8456077F0A853c667BF18F4B77E4B3Ca0cB1',
      usdc(stake)
    );
  } catch (approveError) {
    console.log(approveError);
    throw 'USD Transaction Failed';
  }
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/betting/competitions/create',
      data: {
        name,
        version,
        creator,
        eventIds,
        invitations,
        payoutRule,
        stake,
        isPublic,
      },
    });
    ga.event({
      action: 'betting',
      category: `${isPublic ? 'public' : 'private'}_competition`,
      label: 'Create Competition',
      value: stake,
    });
    return res.data;
  } catch (createError) {
    throw 'Creation Failed';
  }
}

export async function createSingleCompetition({
  event,
  stake,
  creator,
  isPublic,
  invitations = [],
}) {
  try {
    const competitionId = await createCompetition({
      name: event.name,
      creator,
      eventIds: [event.id],
      invitations,
      payoutRule: 'WINNER_TAKES_IT_ALL',
      stake,
      isPublic,
    });

    const competition = await new Promise((res, rej) => {
      let retry = 0;
      const interval = setInterval(async () => {
        try {
          const { data } = await axios({
            url: '/api/betting/competitions/show',
            params: { id: competitionId },
          });

          if (data && data?.games && data.games[0].id) {
            clearInterval(interval);
            res(data);
          }
          console.log(`Retrying: ${retry++}`);
        } catch (error) {
          console.log(`Retrying: ${retry++}`);
        }
      }, 1000);
    });

    return {
      competitionId,
      blockchainId: competition.blockchainId,
      gameId: competition.games[0].id,
    };
  } catch (error) {
    throw error;
  }
}

export async function joinSingleCompetition({
  userAddress,
  stake,
  secret = '',
  poolAddress,
  poolVersion,
}) {
  try {
    try {
      await joinPool(
        poolAddress,
        userAddress,
        stake,
        secret,
        versionLookup[poolVersion.toLowerCase()].number
      );
    } catch (error) {
      if (error != '204: Already Member') {
        throw error;
      }
    }
    ga.event({
      action: 'betting',
      category: `${secret ? 'private' : 'public'}_competition`,
      label: 'Join Competition',
      value: stake,
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function createFreeRollCompetition({
  name,
  version = 'BETA',
  eventIds,
  invitations = [],
  payoutRule,
  stake,
  isPublic,
  maxMembers,
}) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/betting/competitions/freeroll/create',
      data: {
        name,
        version,
        eventIds,
        invitations,
        payoutRule,
        stake,
        isPublic,
        maxMembers,
      },
    });
    return res.data;
  } catch (createError) {
    throw 'Creation Failed';
  }
}

export async function joinFreeRollCompetition({ competitionId, userAddress }) {
  try {
    await postAndWaitForTransaction({
      url: '/api/betting/competitions/freeroll/join',
      body: {
        competitionId,
        userAddress,
      },
    });
    ga.event({
      action: 'betting',
      category: 'public_competition',
      label: 'Join Freeroll Competition',
      value: 0,
    });
  } catch (createError) {
    console.log(createError);
    throw typeof createError == 'string'
      ? createError
      : 'Could not Join Competition';
  }
}
