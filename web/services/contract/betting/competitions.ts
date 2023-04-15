import { initPool, latestVersion } from './../init';
import { SupportedDistributorVersion, SupportedPoolVersion } from './../types';
import { FormattedCompetition, FormattedEvent } from './../../bettingHelpers';
import axios from 'axios';
import { postAndWaitForTransaction } from '../../backendApi';
import { usdc } from '../../formatter';
import { launcherAddress, versionLookup } from '../init';
import { joinPool } from '../pools';
import { approveUSDC } from '../token';
import * as ga from '../../../lib/google-analytics';
import { SupportedChain } from '../types';

type CreateCompetitionProps = {
  name: string;
  creator: string;
  eventIds: number[];
  invitations?: string[];
  payoutRule: string;
  stake: number;
  isPublic: boolean;
  version: SupportedDistributorVersion;
  chain: SupportedChain;
};

export async function createCompetition({
  name,
  creator,
  eventIds,
  invitations = [],
  payoutRule,
  stake,
  isPublic,
  version,
  chain,
}: CreateCompetitionProps) {
  try {
    await approveUSDC(
      creator,
      launcherAddress(latestVersion.name, chain),
      usdc(stake),
      chain
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
        chain,
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

type CreateSingleCompetitionProps = {
  event: FormattedEvent;
  stake: number;
  creator: string;
  isPublic: boolean;
  invitations?: string[];
  chain: SupportedChain;
  version: SupportedDistributorVersion;
};

export async function createSingleCompetition({
  event,
  stake,
  creator,
  isPublic,
  invitations = [],
  chain,
  version,
}: CreateSingleCompetitionProps) {
  try {
    const competitionId = await createCompetition({
      name: event.name,
      creator,
      eventIds: [event.id],
      invitations,
      payoutRule: 'WINNER_TAKES_IT_ALL',
      stake,
      isPublic,
      chain,
      version,
    });

    const competition: FormattedCompetition = await new Promise((res, rej) => {
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

type JoinCompetitionProps = {
  userAddress: string;
  stake: number;
  secret?: string;
  poolAddress: string;
  poolVersion: SupportedPoolVersion;
  chain: SupportedChain;
};

export async function joinSingleCompetition({
  userAddress,
  stake,
  secret = '',
  poolAddress,
  poolVersion,
  chain,
}: JoinCompetitionProps) {
  try {
    try {
      await joinPool(
        poolAddress,
        userAddress,
        stake,
        secret,
        versionLookup[poolVersion.toLowerCase()].number,
        chain
      );
    } catch (error) {
      if (error != '204: Already Member') {
        const [poolContract] = initPool(poolAddress, chain);
        const isMember = await poolContract.isMember(userAddress);
        if (!isMember) {
          throw error;
        }
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

type CreateFreeRollCompetitionProps = {
  name: string;
  eventIds: number[];
  invitations?: string[];
  payoutRule: string;
  stake: number;
  isPublic: boolean;
  maxMembers: number;
  version: SupportedDistributorVersion;
  chain: SupportedChain;
};

export async function createFreeRollCompetition({
  name,
  eventIds,
  invitations = [],
  payoutRule,
  stake,
  isPublic,
  maxMembers,
  version,
  chain,
}: CreateFreeRollCompetitionProps) {
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
        chain,
      },
    });
    return res.data;
  } catch (createError) {
    throw 'Creation Failed';
  }
}

type JoinFreeRollCompetitionProps = {
  competitionId: number;
  userAddress: string;
  chain: SupportedChain;
};

export async function joinFreeRollCompetition({
  competitionId,
  userAddress,
  chain,
}: JoinFreeRollCompetitionProps) {
  try {
    await postAndWaitForTransaction({
      url: '/api/betting/competitions/freeroll/join',
      body: {
        competitionId,
        userAddress,
      },
      chain,
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
