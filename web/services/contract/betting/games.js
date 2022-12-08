import axios from 'axios';
import { ethers } from 'ethers';
import useWeb3 from '/hooks/useWeb3';
import { connectContract, gasPrice } from '../init';
import { distributorAddress, initDistributor } from './init';
import { postAndWaitForTransaction } from '../../backendApi';
import * as ga from '/lib/google-analytics';

export async function registerGame(
  name,
  stake,
  tokenAddress,
  event,
  payoutRule,
  poolAddress
) {
  const [distributor] = initDistributor(event.version);
  const iface = new ethers.utils.Interface([
    'event NewGame(uint256 indexed id, string name, uint256 eventId)',
  ]);

  try {
    let tx;
    if (event.version == 'ALPHA') {
      tx = await connectContract(distributor).registerGame(
        name,
        stake,
        tokenAddress,
        event.blockchainId,
        payoutRule,
        { gasPrice: await gasPrice() }
      );
    } else if (event.version == 'BETA') {
      tx = await connectContract(distributor).registerGame(
        name,
        stake,
        tokenAddress,
        event.blockchainId,
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
    const { id } = events.filter((e) => e)[0];

    const data = {
      version: event.version,
      id: id.toNumber(),
      name,
      stake,
      tokenAddress,
      event,
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
  competitionId,
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
      ['uint256', 'address', 'uint256[]'],
      [gameId, address, prediction],
      true,
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
