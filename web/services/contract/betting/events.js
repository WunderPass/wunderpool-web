import axios from 'axios';
import { ethers } from 'ethers';
import { connectContract, gasPrice } from '../init';
import { initDistributor } from './init';

export async function registerEvent(name, endDate, eventType, params = {}) {
  const [distributor] = initDistributor('BETA');
  const iface = new ethers.utils.Interface([
    'event NewEvent(uint256 indexed id, string name, uint256 endDate)',
  ]);

  try {
    const tx = await connectContract(distributor).registerEvent(
      name,
      endDate,
      eventType,
      { gasPrice: await gasPrice() }
    );

    const receipt = await tx.wait();
    const events = receipt.logs.map((log) => {
      try {
        return iface.decodeEventLog('NewEvent', log.data, log.topics);
      } catch {
        return null;
      }
    });
    const event = events.filter((e) => e)[0];
    const { id } = event;

    const data = {
      version: 'BETA',
      id: id.toNumber(),
      name,
      endDate,
      eventType,
      owner: '0xe11e61b3A603Fb1d4d208574bfc25cF69177BB0C',
      ...params,
    };

    const res = await axios({
      method: 'POST',
      url: '/api/betting/events/create',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function resolveEvent(eventId, outcome, version) {
  const [distributor] = initDistributor(version);
  try {
    const tx = await connectContract(distributor).setEventOutcome(
      eventId,
      outcome,
      {
        gasPrice: await gasPrice(),
      }
    );

    await tx.wait();
    const data = {
      eventId,
      outcome,
      version,
    };

    const res = await axios({
      method: 'POST',
      url: '/api/betting/events/resolve',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
