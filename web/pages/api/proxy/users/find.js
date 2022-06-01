const fs = require('fs');

export default async function handler(req, res) {
  const users = JSON.parse(fs.readFileSync('./data/userMapping.json', 'utf8'));
  let status, data;

  if (req.query.wunderId) {
    const user = users.filter((u) => u.wunderId == req.query.wunderId)[0];
    data = user || {
      error: `No User found for WunderId ${req.query.wunderId}`,
    };
    status = user ? 200 : 404;
  } else if (req.query.address) {
    const user = users.filter(
      (u) => u.address.toLowerCase() == req.query.address.toLowerCase()
    )[0];
    data = user || { error: `No User found for Address ${req.query.address}` };
    status = user ? 200 : 404;
  } else {
    data = { error: 'Address or WunderId missing' };
    status = 403;
  }
  res.status(status).json(data);
}
