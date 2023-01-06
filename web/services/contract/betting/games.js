import useWeb3 from '/hooks/useWeb3';
import { distributorAddress } from './init';
import { postAndWaitForTransaction } from '../../backendApi';
import * as ga from '/lib/google-analytics';

export async function registerParticipant(
  competitionId,
  blockchainId,
  gameId,
  prediction,
  userAddress,
  version
) {
  const { openPopup, sendSignatureRequest } = useWeb3();
  const popup = openPopup('sign');
  const address = distributorAddress(version);
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

export async function registerParticipantForMulti(
  competitionId,
  blockchainId,
  gameId,
  prediction,
  userAddress,
  version,
  bets
) {
  const { openPopup, sendSignatureRequest } = useWeb3();
  const popup = openPopup('sign');
  const address = distributorAddress(version);
  try {
    const { signature } = await sendSignatureRequest(
      ['uint256', 'uint256[]', 'address', 'uint256[][]'],
      [blockchainId, [gameId], address, [prediction]],
      false,
      popup
    );

    console.log('prediction', prediction);
    console.log('gameId', gameId);
    console.log('userAddress', userAddress);
    console.log('version', version);
    console.log('blockchainId', blockchainId);
    console.log('bets', bets);
    console.log('competitionId', competitionId);

    await postAndWaitForTransaction({
      url: '/api/betting/competitions/bets',
      body: {
        competitionId,
        gameId,
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
    console.log('thats the erro', error);
    throw error;
  }
}
