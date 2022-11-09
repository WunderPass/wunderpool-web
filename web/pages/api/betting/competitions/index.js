import axios from 'axios';
import { compAddr } from '/services/memberHelpers';
import { formatCompetition } from '/services/bettingHelpers';

export default async function handler(req, res) {
  try {
    const { poolAddress, userAddress, competitionId } = req.query;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const { data } = await axios({
      url: `${process.env.BETTING_SERVICE}/competitions`,
      headers,
    });
    const allCompetitions = data.map(formatCompetition);
    let filteredCompetitions = allCompetitions;

    if (poolAddress) {
      filteredCompetitions = allCompetitions.filter((competition) =>
        compAddr(competition.poolAddress, poolAddress)
      );
    } else if (userAddress) {
      filteredCompetitions = allCompetitions.filter((competition) =>
        competition.members.find((member) =>
          compAddr(member.address, userAddress)
        )
      );
    } else if (competitionId) {
      filteredCompetitions = allCompetitions.filter(
        (competition) => competition.id == competitionId
      );
    }

    res.status(200).json(filteredCompetitions);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}