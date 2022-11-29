import axios from 'axios';
import { compAddr } from '../../../../services/memberHelpers';
import { formatCompetition } from '/services/bettingHelpers';

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
      sum(filterBy(c, state).map((g) => g.participants.length * c.stake))
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
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const data = [];
    let page = 0;

    while (true) {
      const { data: pageData } = await axios({
        url: `${process.env.BETTING_SERVICE}/competitions`,
        params: { states: 'HISTORIC,LIVE,UPCOMING', page: page++ },
        headers,
      });
      if (pageData.length > 0) {
        data.push(...pageData);
      } else {
        break;
      }
    }

    const competitions = data.map(formatCompetition);
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
        sum(competitions.map((c) => c.stake * c.members.length)) * 0.049,
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
