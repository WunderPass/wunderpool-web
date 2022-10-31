import axios from 'axios';
import { ethers } from 'ethers';
import useWeb3 from '/hooks/useWeb3';
import { connectContract, gasPrice } from '../init';
import { initDistributor } from './init';

export async function registerGame(
  name,
  stake,
  tokenAddress,
  eventId,
  payoutRule,
  poolAddress,
  version
) {
  const [distributor] = initDistributor(version);
  const iface = new ethers.utils.Interface([
    'event NewGame(uint256 indexed id, string name, uint256 eventId)',
  ]);

  try {
    let tx;
    if (version == 'ALPHA') {
      tx = await connectContract(distributor).registerGame(
        name,
        stake,
        tokenAddress,
        eventId,
        payoutRule,
        { gasPrice: await gasPrice() }
      );
    } else if (version == 'BETA') {
      tx = await connectContract(distributor).registerGame(
        name,
        stake,
        tokenAddress,
        eventId,
        payoutRule,
        false,
        { gasPrice: await gasPrice() }
      );
    }

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
      version,
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
  version
) {
  const { openPopup, sendSignatureRequest } = useWeb3();
  const popup = openPopup('sign');
  try {
    const [distributor] = initDistributor(version);
    const { signature } = await sendSignatureRequest(
      ['uint256', 'address', 'uint256[]'],
      [gameId, distributor.address, prediction],
      true,
      popup
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
    const data = {
      gameId,
      address: participant,
      prediction,
      wunderId,
      version,
    };

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

export async function determineGame(gameId, version) {
  try {
    const [distributor] = initDistributor(version);
    const tx = await connectContract(distributor).determineGame(gameId, {
      gasPrice: await gasPrice(),
    });

    await tx.wait();
    const data = {
      gameId,
      version,
    };

    const res = await axios({
      method: 'POST',
      url: '/api/betting/games/close',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    if (/game already closed/i.test(error)) {
      const data = {
        gameId,
        version,
      };

      const res = await axios({
        method: 'POST',
        url: '/api/betting/games/close',
        data,
      });
      return res.data;
    } else {
      throw error;
    }
  }
}
