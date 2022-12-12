const http = require('https');

export default function handler(req, res) {
  return new Promise((resolve) => {
    const options = {
      hostname: `identity-service.wunderpass.org`,
      path: encodeURI(`/v4/wunderPasses/${req.query.wunderId}/image`),
      headers: {
        authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
    };
    http.get(options, function (resp) {
      if (resp.statusCode == 200 && resp.headers['content-type']) {
        resp.pipe(res.setHeader('content-type', resp.headers['content-type']));
        resolve();
      } else {
        const json = JSON.stringify({ wunderId: req.query.wunderId });
        res.status(200).setHeader('content-type', 'plain/text').json(json);
      }
    });
  });
}
