import axios from 'axios';
import { compAddr } from '../../../../services/memberHelpers';
import { formatCompetition } from '/services/bettingHelpers';

const admins = [
  '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
  '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
  '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
  '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
  '0x466274eefdd3265e3d8085933e69890f33023048', // Max
  '0x3c782466d0560b05928515cf31def4ff308b947a', // Max2
  '0xe732f335f354b3918e8e38c957471a4b991abdc1', // Holy Jesus
];

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}

function occurences(array) {
  return array.reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
  }, {});
}

function filterBy(comp, state) {
  return comp.games.filter((g) => g.state == state);
}

function getGameCount(comps, state) {
  return sum(comps.map((c) => filterBy(c, state).length));
}

function getPotSize(comps, state) {
  return sum(
    comps.map((c) =>
      sum(
        filterBy(c, state).map(
          (g) =>
            g.participants.length *
            (c.sponsored ? c.stake / c.maxMembers : c.stake)
        )
      )
    )
  );
}

function getTopTen(comps) {
  const betsPerUser = {};
  comps.forEach((c) =>
    c.games.forEach((g) =>
      g.participants.forEach(
        (p) => (betsPerUser[p.address] = (betsPerUser[p.address] || 0) + 1)
      )
    )
  );
  return Object.entries(betsPerUser)
    .map(([address, bets]) => ({ address, bets }))
    .sort((a, b) => b.bets - a.bets)
    .slice(0, 10);
}

export default async function handler(req, res) {
  try {
    const ignoreAdmins = req.query.ignoreAdmins == 'true';
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const data = [];
    let page = 0;

    while (true) {
      const { data: competitionData } = await axios({
        url: `${process.env.BETTING_SERVICE}/competitions`,
        params: { states: 'HISTORIC,LIVE,UPCOMING', page: page++ },
        headers,
      });
      if (competitionData.content.length > 0) {
        data.push(...competitionData.content);
      } else {
        break;
      }
    }

    const allCompetitions = data.map(formatCompetition);
    const competitions = ignoreAdmins
      ? allCompetitions.map((c) => ({
          ...c,
          games: c.games.map((g) => ({
            ...g,
            participants: g.participants.filter(
              (p) => !admins.includes(p.address.toLowerCase())
            ),
          })),
          members: c.members.filter(
            (m) => !admins.includes(m.address.toLowerCase())
          ),
        }))
      : allCompetitions;
    const uniqueUsers = [
      ...new Set(
        competitions
          .map((c) =>
            c.games.map((g) => g.participants.map((p) => p.address)).flat()
          )
          .flat()
      ),
    ];

    const membersPerGame = competitions.map((c) => c.members.length);

    const stats = {
      gameCount: {
        historic: getGameCount(competitions, 'HISTORIC'),
        live: getGameCount(competitions, 'LIVE'),
        upcoming: getGameCount(competitions, 'UPCOMING'),
      },
      potSize: {
        historic: getPotSize(competitions, 'HISTORIC'),
        live: getPotSize(competitions, 'LIVE'),
        upcoming: getPotSize(competitions, 'UPCOMING'),
      },
      uniqueUsers: uniqueUsers.length,
      totalBets: sum(
        competitions.map((c) => sum(c.games.map((g) => g.participants.length)))
      ),
      feesEarned:
        sum(
          competitions.map(
            (c) => c.stake * (c.sponsored ? 1 : c.members.length)
          )
        ) * 0.049,
      membersPerGame: {
        count: sum(membersPerGame) / competitions.length,
        data: occurences(membersPerGame),
      },
      gamesPerMember: {
        count:
          sum(competitions.map((c) => c.games.length)) / uniqueUsers.length,
        data: occurences(
          uniqueUsers.map(
            (addr) =>
              competitions.filter((c) =>
                c.members.find((m) => compAddr(m.address, addr))
              ).length
          )
        ),
      },
      topTen: getTopTen(competitions),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
