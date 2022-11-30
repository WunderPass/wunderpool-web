const fs = require('fs');
import axios from 'axios';

export default async function handler(req, res) {
  try {
    let stats = [];
    if (process.env.NODE_ENV == 'development') {
      stats = (
        await axios({
          url: 'https://app.casama.io/api/betting/admin/statsHistory',
        })
      ).data;
    } else {
      if (fs.existsSync('./data/bettingStats.json')) {
        stats = JSON.parse(fs.readFileSync('./data/bettingStats.json', 'utf8'));
      }
    }

    res.status(200).json(stats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
