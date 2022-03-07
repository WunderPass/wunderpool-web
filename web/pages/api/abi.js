const fs = require('fs');

export default function handler(req, res) {
  const {type} = req.query;
  const abi = fs.readFileSync(`assets/abi/${type}.json`);
  res.status(200).json(JSON.parse(abi));
}
