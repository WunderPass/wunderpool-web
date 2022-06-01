const fs = require('fs');

export default async function handler(req, res) {
  try {
    const { address, wunderId } = req.body;

    if (address && wunderId) {
      const users = JSON.parse(
        fs.readFileSync('./data/userMapping.json', 'utf8')
      );

      const user = users.filter(
        (u) => u.address.toLowerCase() == address.toLowerCase()
      )[0];
      if (user) {
        res.status(200).json(user);
        return;
      } else {
        users.push({ wunderId: wunderId, address: address, relevance: 0 });
        fs.writeFileSync('./data/userMapping.json', JSON.stringify(users));
        res.status(200).json(user);
        return;
      }
    } else {
      res.status(403).json({ error: `Missing Param wunderId or address` });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
