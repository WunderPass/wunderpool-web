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
  gameIds,
  userAddress,
  version,
  bets
) {
  const { openPopup, sendSignatureRequest } = useWeb3();
  const popup = openPopup('sign');
  const address = distributorAddress(version);

  let predictions = [];
  bets.map((bet) => {
    let prediction = [];
    prediction.push(bet.home_score);
    prediction.push(bet.guest_score);
    predictions.push(prediction);
  });

  try {
    const { signature } = await sendSignatureRequest(
      ['uint256', 'uint256[]', 'address', 'uint256[][]'],
      [blockchainId, gameIds, address, predictions],
      false,
      popup
    );

    await postAndWaitForTransaction({
      url: '/api/betting/competitions/bets',
      body: {
        competitionId,
        gameId: gameIds,
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
