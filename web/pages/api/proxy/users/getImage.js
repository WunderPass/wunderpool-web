const fs = require('fs');
const http = require('https');

export default function handler(req, res) {
  const options = {
    hostname: 'identity-service.wunderpass.org',
    path: `/v4/wunderPasses/${req.query.wunderId}/image`,
    headers: {
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
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
      const json = JSON.stringify({ wunderId: req.query.wunderId });
      res.status(200).setHeader('content-type', 'plain/text').json(json);
    }
  });
}
