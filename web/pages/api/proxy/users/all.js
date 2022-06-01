const fs = require('fs');

export default async function handler(req, res) {
  try {
    const users = JSON.parse(
      fs.readFileSync('./data/userMapping.json', 'utf8')
    ).sort((a, b) => {
      if (a.relevance === b.relevance) {
        return 0;
      } else if (a.relevance === null) {
        return 1;
      } else if (b.relevance === null) {
        return -1;
      } else {
        return a.relevance < b.relevance ? 1 : -1;
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
