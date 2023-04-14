import axios from 'axios';
const network = 'POLYGON';

type FilterContactsResponse = {
  wunder_id: string;
  firstname: string;
  lastname: string;
  handle: string;
  email: string;
  phone_number: string;
  wallet_address: string;
  image_location: string;
};

async function getUserByWunderId(
  wunderId: string
): Promise<[200, FilterContactsResponse] | [500, any]> {
  try {
    const { data }: { data: FilterContactsResponse[] } = await axios({
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/${wunderId}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
    });
    return [200, data.find((u) => u.wunder_id == wunderId)];
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

async function getUsersByAddress(
  address: string
): Promise<[200, FilterContactsResponse] | [404, string] | [500, any]> {
  try {
    const { data }: { data: FilterContactsResponse[] } = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/${network}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
      data: [address.toLowerCase()],
    });
    if (data.length == 1) {
      return [200, data[0]];
    } else {
      return [404, 'User not Found'];
    }
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

async function getUsersByAddresses(
  addresses: string[]
): Promise<[200, FilterContactsResponse[]] | [500, any]> {
  try {
    const { data }: { data: FilterContactsResponse[] } = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/${network}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
      data: addresses.map((a) => a.toLowerCase()),
    });
    return [200, data];
  } catch (error) {
    console.log(error);
    return [500, error];
  }
}

export type UsersFindResponse<T> = T extends string
  ? FilterContactsResponse
  : FilterContactsResponse[];

export default async function handler(req, res) {
  const { wunderId, address, addresses } = req.body || {};
  let status: number, data: unknown;
  if (wunderId) {
    [status, data] = await getUserByWunderId(wunderId);
  } else if (address) {
    [status, data] = await getUsersByAddress(address);
  } else if (addresses) {
    [status, data] = await getUsersByAddresses(addresses);
  } else {
    [status, data] = [403, { error: 'Address/Addresses or WunderId missing' }];
  }
  return res.status(status).json(data);
}
