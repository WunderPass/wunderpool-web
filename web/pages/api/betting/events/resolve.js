const fs = require('fs');

export default async function handler(req, res) {
  try {
    let events = [];
    if (fs.existsSync('./data/events.json')) {
      events = JSON.parse(fs.readFileSync('./data/events.json', 'utf8'));
    }

    const { eventId, outcome, version } = req.body;

    const event = events.find((e) => e.id == eventId && e.version == version);
    event.outcome = outcome;
    event.resolved = true;
    fs.writeFileSync('./data/events.json', JSON.stringify(events));
    res.status(200).json({ eventId, outcome });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
