const fs = require('fs');

export default async function handler(req, res) {
  try {
    let stats = [];
    if (fs.existsSync('./data/bettingStats.json')) {
      stats = JSON.parse(fs.readFileSync('./data/bettingStats.json', 'utf8'));
    }

    res.status(200).json(stats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
