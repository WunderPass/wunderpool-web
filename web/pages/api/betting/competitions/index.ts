import { FormattedCompetition } from './../../../../services/bettingHelpers';
import axios from 'axios';
import { compAddr } from '../../../../services/memberHelpers';
import { formatCompetition } from '../../../../services/bettingHelpers';
import { translateChain } from '../../../../services/backendApi';

export type BettingCompetitionsResponse = {
  content: FormattedCompetition[];
  pageData: {
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    pageable: {
      offset: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      pageNumber: number;
      pageSize: number;
      paged: boolean;
      unpaged: boolean;
    };
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

export default async function handler(req, res) {
  try {
    const {
      poolAddress,
      userAddress,
      states,
      sponsored,
      page,
      size,
      sort,
      chain,
    } = req.query;
    if (!chain) return res.status(400).json('Invalid Request: Missing Chain');

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const { data } = await axios({
      url: `${process.env.BETTING_SERVICE}/competitions`,
      params: {
        states,
        userAddress,
        page,
        size,
        sponsored,
        sort,
        network: translateChain(chain),
      },
      headers,
    });

    const { content, ...pageData } = data;

    const allCompetitions: FormattedCompetition[] =
      content.map(formatCompetition);
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
    }
    res.status(200).json({ content: filteredCompetitions, pageData });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
