export default function handler(req, res) {
  console.log(req.query.log);
  res.status(200).json({ logged: true });
}
