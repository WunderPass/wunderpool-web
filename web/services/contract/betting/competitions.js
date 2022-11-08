import axios from 'axios';
import { usdc } from '../../formatter';
import { versionLookup } from '../init';
import { createPool, getPoolAddressFromTx, joinPool } from '../pools';
import { approveUSDC } from '../token';
import { registerGame, registerParticipant } from './games';

async function createCompetition({
  name,
  creator,
  eventIds,
  invitations,
  payoutRule,
  stake,
  isPublic,
  version = 'BETA',
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
  prediction,
  invitations = [],
  afterPoolCreate = async () => {},
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

    await afterPoolCreate();

    console.log('competitionId', competitionId);

    const competition = await new Promise((res, rej) => {
      const interval = setInterval(async () => {
        const { data } = await axios({
          url: '/api/betting/competitions/show',
          params: { id: competitionId },
        });

        if (data && data?.games && data.games[0].id) {
          clearInterval(interval);
          res(data);
        }
      }, 1000);
    });

    console.log(competition);
    const game = competition.games[0];

    await registerParticipant(
      competitionId,
      game.id,
      prediction,
      creator,
      event.version
    );

    return game;
  } catch (error) {
    throw error;
  }
}

export async function joinSingleCompetition({
  gameId,
  prediction,
  userAddress,
  wunderId,
  event,
  stake,
  poolAddress,
  poolVersion,
  afterPoolJoin = async () => {},
}) {
  try {
    try {
      await joinPool(
        poolAddress,
        userAddress,
        stake / 1000000,
        '',
        versionLookup[poolVersion.toLowerCase()].number
      );
    } catch (error) {
      if (error != '204: Already Member') {
        throw error;
      }
    }
    await afterPoolJoin();
    await registerParticipant(
      gameId,
      prediction,
      userAddress,
      wunderId,
      event.version
    );
    return true;
  } catch (error) {
    throw error;
  }
}
