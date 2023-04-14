import axios from 'axios';

export type AllUsersResponse = {
  wunder_id: string;
  firstname: string;
  lastname: string;
  handle: string;
  email: string;
  phone_number: string;
  wallet_address: string;
  image_location: string;
}[];

export default async function handler(req, res) {
  try {
    const resp = await axios({
      url: encodeURI(`${process.env.IDENTITY_SERVICE}/v4/contacts/all`),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
