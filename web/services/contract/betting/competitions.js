import axios from 'axios';
import { versionLookup } from '../init';
import { createPool, getPoolAddressFromTx, joinPool } from '../pools';
import { registerGame, registerParticipant } from './games';

// export async function createCompetition({
//   name,
//   creator,
//   events,
//   invitations,
//   payoutRule,
//   stake,
//   isPublic,
//   version = 'BETA',
//   network = 'POLYGON_MAINNET',
// }) {
//   try {
//     await approveUSDC(
//       creator,
//       '0x8c3B8456077F0A853c667BF18F4B77E4B3Ca0cB1',
//       usdc(stake)
//     );
//   } catch (approveError) {
//     throw 'USD Transaction Failed';
//   }
//     try {
//       const res = await axios({
//         method: 'POST',
//         url: '/api/betting/competitions/create',
//         data: {
//           name,
//           version,
//           network,
//           creator,
//           events,
//           invitations,
//           payoutRule,
//           stake,
//           isPublic,
//         },
//       });
//       return res.data;
//     } catch (createError) {
//       throw 'Creation Failed';
//     }
// }
export async function createSingleCompetition({
  event,
  stake,
  creator,
  wunderId,
  isPublic,
  prediction,
}) {
  try {
    const txHash = await createPool({
      creator,
      poolName: event.name,
      tokenName: 'Competition Token',
      tokenSymbol: 'CT',
      minInvest: stake,
      maxInvest: stake,
      amount: stake,
      members: [],
      votingTime: 3600,
      minYesVoters: 1,
      isPublic,
      autoLiquidateTs: Number(new Date(event.endTime)),
    });
    console.log(txHash);
    const { address: poolAddress, governanceToken } =
      await getPoolAddressFromTx(txHash);
    const game = await registerGame(
      event.name,
      stake * 1000000,
      governanceToken,
      event,
      0,
      poolAddress
    );
    await registerParticipant(
      game.id,
      prediction,
      creator,
      wunderId,
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
}) {
  try {
    await joinPool(
      poolAddress,
      userAddress,
      stake / 1000000,
      '',
      versionLookup[poolVersion.toLowerCase()].number
    );
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
