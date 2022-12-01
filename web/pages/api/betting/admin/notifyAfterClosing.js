import axios from 'axios';
import { sendCompetitionEndedMail } from '../../../../services/mailer/competitionEnded';
import { compAddr } from '../../../../services/memberHelpers';
import { formatCompetition } from '/services/bettingHelpers';
const fs = require('fs');

async function getUsersByAddresses(addresses) {
  try {
    const resp = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/POLYGON`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
      data: addresses.map((a) => a.toLowerCase()),
    });
    return resp.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function handler(req, res) {
  try {
    let notified = [];
    if (fs.existsSync('./data/notifiedAfterClosing.json')) {
      notified = JSON.parse(
        fs.readFileSync('./data/notifiedAfterClosing.json', 'utf8')
      );
    }

    if (notified.includes(req.body.id)) {
      res.status(200).send('Notified Users');
      return;
    }

    const { data } = await axios({
      url: `${process.env.BETTING_SERVICE}/competitions/${req.body.id}`,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
      },
    });

    const competition = formatCompetition(data);
    const users = await getUsersByAddresses(
      competition.members.map((m) => m.address)
    );

    const members = competition.members.map((m) => {
      const user = users.find((u) => compAddr(u.wallet_address, m.address));
      return {
        email: user?.email,
        firstName: user?.firstname,
        profileName: m.profileName,
        userName: m.userName,
        prediction: competition.games[0].participants.find((p) =>
          compAddr(p.address, m.address)
        )?.prediction,
        profit: m.profit,
      };
    });

    const winners = members.filter((m) => m.email && m.profit > 0);
    winners.map((user) => {
      return sendCompetitionEndedMail({
        to: user.email,
        firstName: user.firstName || user.handle,
        teamHome: competition.games[0].event.teamHome,
        teamAway: competition.games[0].event.teamAway,
        outcome: competition.games[0].event.outcome,
        members,
      });
    });
    notified.push(req.body.id);
    fs.writeFileSync(
      './data/notifiedAfterClosing.json',
      JSON.stringify(notified)
    );
    res.status(200).send(winners);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
