const http = require('https');

export default function handler(req, res) {
  return new Promise((resolve) => {
    if (req.query.address) {
      const options = {
        hostname: 'pools-service.wunderpass.org',
        path: `/web3Proxy/pools/${req.query.address.toLowerCase()}/image`,
        headers: {
          Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
        },
      };

      http.get(options, function (resp) {
        if (resp.statusCode == 200 && resp.headers['content-type']) {
          resp.pipe(
            res.setHeader('content-type', resp.headers['content-type'])
          );
          resolve();
        } else {
          res
            .status(200)
            .setHeader('content-type', 'plain/text')
            .json(JSON.stringify({ address: req.query.address }));
        }
      });
    } else {
      res.status(400).json({ error: 'Invalid Address' }).end();
      resolve();
    }
  });
}
