import axios from 'axios';
import { ethers } from 'ethers';
import useWeb3 from '../../../hooks/useWeb3';
import { connectContract, gasPrice } from '../init';
import { initDistributor } from './init';

export async function registerGame(
  name,
  stake,
  tokenAddress,
  eventId,
  payoutRule,
  poolAddress
) {
  const [distributor] = initDistributor();
  const iface = new ethers.utils.Interface([
    'event NewGame(uint256 indexed id, string name, uint256 eventId)',
  ]);

  try {
    const tx = await connectContract(distributor).registerGame(
      name,
      stake,
      tokenAddress,
      eventId,
      payoutRule,
      { gasPrice: await gasPrice() }
    );

    const receipt = await tx.wait();
    const events = receipt.logs.map((log) => {
      try {
        return iface.decodeEventLog('NewGame', log.data, log.topics);
      } catch {
        return null;
      }
    });
    const event = events.filter((e) => e)[0];
    const { id } = event;

    const data = {
      id: id.toNumber(),
      name,
      stake,
      tokenAddress,
      eventId,
      payoutRule,
      poolAddress,
    };

    const res = await axios({
      method: 'POST',
      url: '/api/betting/games/create',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function registerParticipant(
  gameId,
  prediction,
  participant,
  wunderId,
  tokenAddress,
  stake
) {
  const [distributor, provider] = initDistributor();
  try {
    const { smartContractTransaction, sendSignatureRequest } = useWeb3();
    const token = new ethers.Contract(
      tokenAddress,
      ['function increaseAllowance(address,uint)'],
      provider
    );
    const populatedTx = await token.populateTransaction.increaseAllowance(
      distributor.address,
      stake,
      {
        gasPrice: await gasPrice(),
        from: participant,
      }
    );

    const approveTx = await smartContractTransaction(populatedTx);
    await provider.waitForTransaction(approveTx.hash);

    const { signature } = await sendSignatureRequest(
      ['uint256', 'address', 'uint256[]'],
      [gameId, distributor.address, prediction]
    );

    const tx = await connectContract(distributor).registerParticipantForUser(
      gameId,
      prediction,
      participant,
      signature,
      {
        gasPrice: await gasPrice(),
      }
    );

    await tx.wait();
    const data = { gameId, address: participant, prediction, wunderId };

    const res = await axios({
      method: 'POST',
      url: '/api/betting/games/join',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function determineGame(gameId) {
  const [distributor] = initDistributor();
  try {
    const tx = await connectContract(distributor).determineGame(gameId, {
      gasPrice: await gasPrice(),
    });

    await tx.wait();
    const data = {
      gameId,
    };

    const res = await axios({
      method: 'POST',
      url: '/api/betting/games/close',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
