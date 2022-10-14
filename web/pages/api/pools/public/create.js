const fs = require('fs');

export default async function handler(req, res) {
  try {
    let publicPools = [];
    if (fs.existsSync('./data/publicPools.json')) {
      publicPools = JSON.parse(
        fs.readFileSync('./data/publicPools.json', 'utf8')
      );
    }

    const { poolAddress, inviteLink } = req.body;

    const publicPool = {
      poolAddress,
      inviteLink,
    };

    publicPools.push(publicPool);
    fs.writeFileSync('./data/publicPools.json', JSON.stringify(publicPools));
    res.status(200).json(publicPool);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
