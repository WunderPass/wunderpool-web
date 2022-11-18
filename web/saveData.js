const axios = require('axios');
const fs = require('fs');

async function main() {
  try {
    const { data } = await axios({
      url: 'https://app.casama.io/api/betting/admin/stats',
    });

    let stats = [];
    if (fs.existsSync('./data/bettingStats.json')) {
      stats = JSON.parse(fs.readFileSync('./data/bettingStats.json', 'utf8'));
    }

    const ts = `${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${new Date().getDate()}`;

    if (!stats.find((s) => s.date == ts)) {
      stats.push({ date: ts, ...data });
      fs.writeFileSync('./data/bettingStats.json', JSON.stringify(stats));
    }
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
