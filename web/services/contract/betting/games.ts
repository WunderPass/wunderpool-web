import { SupportedChain, SupportedDistributorVersion } from './../types';
import useWeb3 from '../../../hooks/useWeb3';
import { distributorAddress } from './init';
import { postAndWaitForTransaction } from '../../backendApi';
import * as ga from '../../../lib/google-analytics';

export async function registerParticipant(
  competitionId: number,
  blockchainId: number,
  gameId: number,
  prediction: [number, number],
  userAddress: string,
  version: SupportedDistributorVersion,
  chain: SupportedChain
) {
  const { openPopup, sendSignatureRequest } = useWeb3();
  const popup = openPopup('sign');
  const address = distributorAddress(version, chain);
  try {
    const { signature } = await sendSignatureRequest(
      ['uint256', 'uint256[]', 'address', 'uint256[][]'],
      [blockchainId, [gameId], address, [prediction]],
      false,
      popup
    );
    await postAndWaitForTransaction({
      url: '/api/betting/competitions/bet',
      body: {
        competitionId,
        gameId,
        userAddress,
        prediction,
        signature,
      },
    });
    ga.event({
      action: 'betting',
      category: 'game',
      label: 'Place Bet',
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export type MultiBetFormat = {
  game_id: number;
  home_score?: number;
  guest_score?: number;
};

export async function registerParticipantForMulti(
  competitionId: number,
  blockchainId: number,
  gameIds: number[],
  userAddress: string,
  version: SupportedDistributorVersion,
  bets: MultiBetFormat[],
  chain: SupportedChain
) {
  const { openPopup, sendSignatureRequest } = useWeb3();
  const popup = openPopup('sign');
  const address = distributorAddress(version, chain);

  const sortedIds = gameIds.sort((a, b) => a - b);
  const predictions = bets
    .sort((a, b) => a.game_id - b.game_id)
    .map(({ home_score, guest_score }) => [home_score, guest_score]);

  try {
    const { signature } = await sendSignatureRequest(
      ['uint256', 'uint256[]', 'address', 'uint256[][]'],
      [blockchainId, sortedIds, address, predictions],
      false,
      popup
    );

    await postAndWaitForTransaction({
      url: '/api/betting/competitions/bets',
      body: {
        competitionId,
        gameId: sortedIds,
        userAddress,
        bets,
        signature,
      },
    });
    ga.event({
      action: 'betting',
      category: 'game',
      label: 'Place Bet',
    });
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}
