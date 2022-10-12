import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { poolAddress, userAddress, newMember, secret, validFor, signature } =
      req.body;

    console.log('req.body', req.body);
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const body = {
      inviting_address: userAddress,
      signature: signature,
    };

    let response;

    if (newMember) {
      console.log('in New Member');

      body.invited_address = newMember;

      response = await axios({
        method: 'POST',
        url: `${
          process.env.POOLS_SERVICE
        }/web3Proxy/pools/${poolAddress?.toLowerCase()}/whitelist/address`,
        headers: headers,
        data: body,
      });
    } else if (secret && validFor) {
      console.log('in Secrect amd valid');

      body.secret = secret;
      body.validFor = validFor;

      response = await axios({
        method: 'POST',
        url: `${
          process.env.POOLS_SERVICE
        }/web3Proxy/pools/${poolAddress?.toLowerCase()}/whitelist/secret`,
        headers: headers,
        data: body,
      });
    } else {
      res
        .status(401)
        .json({ error: 'Invalid Invite - newMember or secret required' });
    }

    console.log('response.data', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
