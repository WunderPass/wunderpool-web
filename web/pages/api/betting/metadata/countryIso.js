const fs = require('fs');

export default async function handler(req, res) {
  const { name } = req.query;
  let iso;
  let searchField = 'name';
  let countryJson;

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
    console.log('iso in api', iso.code);

    res.status(200).json(iso.code);
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
}
