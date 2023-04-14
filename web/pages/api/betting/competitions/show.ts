import { FormattedCompetition } from './../../../../services/bettingHelpers';
import axios from 'axios';
import { formatCompetition } from '../../../../services/bettingHelpers';

export type BettingCompetitionShowResponse = FormattedCompetition;

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const { data } = await axios({
      url: `${process.env.BETTING_SERVICE}/competitions/${req.query.id}`,
      headers,
    });

    console.log(data);

    res.status(200).json(formatCompetition(data));
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
