import axios from 'axios';
const network = 'POLYGON';

async function getUserByWunderId(wunderId) {
  try {
    const resp = await axios({
      method: 'get',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/${wunderId}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
      },
    });
    return [200, resp.data.find((u) => u.wunder_id == wunderId)];
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

async function getUsersByAddresses(addresses) {
  var newTypeAddresses = new Array();
  if (typeof addresses == 'string') {
    newTypeAddresses[0] = addresses;
  } else {
    newTypeAddresses = addresses;
  }

  try {
    const resp = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/${network}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
      },
      data: newTypeAddresses.map((a) => a.toLowerCase()),
    });
    return [200, resp.data];
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

export default async function handler(req, res) {
  const { wunderId, address } = req.query || {};
  let status, data;
  if (wunderId) {
    [status, data] = await getUserByWunderId(wunderId);
  } else if (address) {
    [status, data] = await getUsersByAddresses([address]);
    data = status == 200 ? data[0] : data;
  } else if (req.query['addresses[]']) {
    [status, data] = await getUsersByAddresses(req.query['addresses[]']);
  } else {
    [status, data] = [403, { error: 'Address/Addresses or WunderId missing' }];
  }
  res.status(status).json(data);
}
