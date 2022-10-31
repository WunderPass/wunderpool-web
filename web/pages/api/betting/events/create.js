const fs = require('fs');

export default async function handler(req, res) {
  try {
    let events = [];
    if (fs.existsSync('./data/events.json')) {
      events = JSON.parse(fs.readFileSync('./data/events.json', 'utf8'));
    }

    const {
      version,
      id,
      name,
      endDate,
      eventType,
      owner,
      resolved = false,
      outcome = [],
      ...other
    } = req.body;

    const event = {
      version,
      id,
      name,
      endDate,
      eventType,
      owner,
      resolved,
      outcome,
      ...other,
    };
    events.push(event);
    fs.writeFileSync('./data/events.json', JSON.stringify(events));
    res.status(200).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
