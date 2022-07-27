const fs = require('fs');
const http = require('https');

export default function handler(req, res) {
  const options = {
    hostname: 'pools-service.wunderpass.org',
    path: `/web3Proxy/pools/${req.query.poolAddress}/image`,
    headers: {
      Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    },
  };

  http.get(options, function (resp) {
    if (resp.statusCode == 200 && resp.headers['content-type']) {
      res
        .status(200)
        .setHeader('content-type', resp.headers['content-type'])
        .setHeader('content-length', resp.headers['content-length'])
        .send(resp);
      return;
    } else {
      const json = JSON.stringify({ address: req.query.poolAddress });
      res.status(200).setHeader('content-type', 'plain/text').json(json);
    }
  });
}
