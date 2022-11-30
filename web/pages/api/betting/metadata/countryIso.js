const fs = require('fs');

export default async function handler(req, res) {
  const { name } = req.query;
  let iso;
  let searchField = 'name';
  let countryJson = [];

  try {
    if (fs.existsSync('./data/countries.json')) {
      countryJson = JSON.parse(
        fs.readFileSync('./data/countries.json', 'utf8')
      );
    }

    for (var i = 0; i < countryJson.length; i++) {
      if (countryJson[i][searchField] == name) {
        iso = countryJson[i];
      }
    }
    res.status(200).json(iso?.code || name.substr(0, 3));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}
