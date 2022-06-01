const fs = require('fs');

export default async function handler(req, res) {
  try {
    const users = JSON.parse(
      fs.readFileSync('./data/userMapping.json', 'utf8')
    );

    const user = users.filter((u) => u.address == req.query.address)[0];
    if (user) {
      user.relevance += 1;
      fs.writeFileSync('./data/userMapping.json', JSON.stringify(users));
      res.status(200).json(user);
    } else {
      res.status(404).json('Invalid User');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
