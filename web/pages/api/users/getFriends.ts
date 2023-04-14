import axios from 'axios';

export type UserGetFriendsResponse = {
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
    const ownersWunderId = req.query.wunderId;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const response = await axios({
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/connected/${ownersWunderId}`
      ),
      headers: headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toJSON() });
  }
}
