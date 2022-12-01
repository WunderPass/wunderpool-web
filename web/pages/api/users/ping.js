const users = {};
const admins = [
  'g-fricke',
  't-bäckendß',
  't-bitschnau',
  's-tschurilin',
  'm-loechner',
];
export default async function handler(req, res) {
  const { wunderId, seconds } = req.query;
  if (req.method === 'POST') {
    const allowed = admins.includes(wunderId);
    res.status(allowed ? 200 : 401).send(
      allowed
        ? Object.entries(users)
            .filter(
              ([_, lastActive]) =>
                new Date(Number(new Date()) - Number(seconds) * 1000) <
                new Date(lastActive)
            )
            .map(([id, lastActive]) => ({
              wunderId: id,
              lastActive,
            }))
        : 'FORBIDDEN'
    );
    return;
  } else {
    users[wunderId] = new Date();
    console.log(users);
    res.status(200).send('OK');
    return;
  }
}
