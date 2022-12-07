const users = {};
const admins = [
  'g-fricke',
  't-bäckendß',
  't-bitschnau',
  's-tschurilin',
  'm-loechner',
];

export default async function handler(req, res) {
  const { wunderId, handle, seconds } = req.query;
  if (req.method === 'POST') {
    const allowed = admins.includes(wunderId);
    res.status(allowed ? 200 : 401).send(
      allowed
        ? Object.entries(users)
            .filter(
              ([_, { lastActive }]) =>
                new Date(Number(new Date()) - Number(seconds) * 1000) <
                new Date(lastActive)
            )
            .map(([id, { lastActive, handle, url }]) => ({
              wunderId: id,
              lastActive,
              handle,
              url,
            }))
        : 'FORBIDDEN'
    );
    return;
  } else if (wunderId) {
    try {
      const url = req.headers?.referer;
      users[wunderId] = { lastActive: new Date(), handle, url };
    } catch (error) {}
    res.status(200).send('OK');
    return;
  }
  res.status(200).send('OK');
  return;
}
