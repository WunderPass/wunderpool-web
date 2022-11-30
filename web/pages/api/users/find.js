import axios from 'axios';
const network = 'POLYGON';

async function getUserByWunderId(wunderId) {
  try {
    const resp = await axios({
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/${wunderId}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
    });
    return [200, resp.data.find((u) => u.wunder_id == wunderId)];
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

async function getUsersByAddress(address) {
  try {
    const resp = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/${network}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
      data: [address.toLowerCase()],
    });
    if (resp.data.length == 1) {
      return [200, resp.data];
    } else {
      return [404, 'User not Found'];
    }
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

async function getUsersByAddresses(addresses) {
  try {
    const resp = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/${network}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
      data: addresses.map((a) => a.toLowerCase()),
    });
    return [200, resp.data];
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

export default async function handler(req, res) {
  const { wunderId, address, addresses } = req.body || {};
  let status, data;
  if (wunderId) {
    [status, data] = await getUserByWunderId(wunderId);
  } else if (address) {
    [status, data] = await getUsersByAddress(address);
    data = status == 200 ? data[0] : data;
  } else if (addresses) {
    [status, data] = await getUsersByAddresses(addresses);
  } else {
    [status, data] = [403, { error: 'Address/Addresses or WunderId missing' }];
  }
  res.status(status).json(data);
}
