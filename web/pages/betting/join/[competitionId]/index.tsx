import { Container } from '@mui/material';
import MultiCard from '../../../../components/betting/multi/multiCard';
import CustomHeader from '../../../../components/general/utils/customHeader';
import { UseBettingService } from '../../../../hooks/useBettingService';
import { UseNotification } from '../../../../hooks/useNotification';
import { UseUserType } from '../../../../hooks/useUser';
import { FormattedCompetition } from '../../../../services/bettingHelpers';
import { BettingCompetitionShowResponse } from '../../../api/betting/competitions/show';

type JoinCompetitionProps = {
  competition: FormattedCompetition;
  bettingService: UseBettingService;
  user: UseUserType;
  metaTagInfo: {
    title: string;
    description?: string;
    imageUrl: string;
  };
  handleInfo: UseNotification.handleInfo;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
};

export default function JoinCompetition(props: JoinCompetitionProps) {
  const { competition, metaTagInfo } = props;
  return (
    <>
      <CustomHeader
        title={metaTagInfo.title}
        description={metaTagInfo.description}
        imageUrl={metaTagInfo.imageUrl}
      />
      <Container
        className="flex flex-col justify-center items-center gap-3"
        maxWidth="xl"
      >
        <div className="flex flex-col my-8 w-full ">
          <MultiCard competition={competition} {...props} />
        </div>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const { competitionId, secret } = context.query;

  try {
    const competition: BettingCompetitionShowResponse = await (
      await fetch(
        `https://app.casama.io/api/betting/competitions/show?id=${competitionId}`
      )
    ).json();

    if (!competition) {
      return {
        redirect: {
          permanent: false,
          destination: `/betting`,
        },
      };
    } else if (competition.games.length == 1) {
      return {
        redirect: {
          permanent: false,
          destination: `/betting/join/${competitionId}/${
            competition.games[0].id
          }${secret ? `?secret=${secret}` : ''}`,
        },
      };
    }
    const teamIds = [
      ...new Set(
        competition.games.flatMap(({ event }) => [
          event.teamAway.id,
          event.teamHome.id,
        ])
      ),
    ].join(',');

    return {
      props: {
        competition: competition,
        metaTagInfo: {
          title: 'Casama - Combo bet',
          description: `Casama - Combo bet for ${competition.name}`,
          imageUrl: `/api/betting/metadata/ogImageMulti?eventName=${competition.name}&teamIds=${teamIds}`,
        },
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        metaTagInfo: {
          title: 'Casama - Betting with Friends',
          imageUrl: `/api/betting/metadata/ogImage`,
        },
      },
    };
  }
}
