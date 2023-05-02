import { Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import JoinGameCard from '../../../../components/betting/games/joinGameCard';
import CustomHeader from '../../../../components/general/utils/customHeader';
import { UseNotification } from '../../../../hooks/useNotification';
import { UseUserType } from '../../../../hooks/useUser';
import {
  FormattedCompetition,
  FormattedGame,
  userIsParticipant,
} from '../../../../services/bettingHelpers';

type JoinCompetitionGameProps = {
  competition: FormattedCompetition;
  game: FormattedGame;
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

export default function JoinCompetitionGame(props: JoinCompetitionGameProps) {
  const router = useRouter();
  const { competition, game, user, metaTagInfo, handleInfo } = props;

  const loginCallback = () => {
    router.push(`/betting/bets?sortId=${competition?.competitionId}`);
  };

  useEffect(() => {
    if (!user.address) return;
    if (game?.id) {
      if (userIsParticipant(competition, game.id, user.address)) {
        handleInfo('You already placed a bet for this game');
        loginCallback();
      }
    } else {
      handleInfo('This Bet does not exist');
      router.push('/betting/multi');
    }
  }, [game?.id, user?.address]);

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
          <JoinGameCard
            game={game}
            competition={competition}
            secret={router.query.secret as string}
            user={user}
            {...props}
          />
        </div>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const { competitionId, gameId } = context.query;

  try {
    const data = await (
      await fetch(
        `https://app.casama.io/api/betting/competitions/show?id=${competitionId}`
      )
    ).json();
    const game = data?.games?.find((g) => g.id == gameId);
    const event = game?.event;

    if (
      event.teamHome?.name &&
      event.teamAway?.name &&
      event.teamHome?.id &&
      event.teamAway?.id
    ) {
      return {
        props: {
          competition: data,
          game,
          metaTagInfo: {
            title: `Casama - Bet on ${event.teamHome.name} vs. ${event.teamAway.name}`,
            description: event.name,
            imageUrl: `/api/betting/metadata/ogImage?teamHomeId=${event.teamHome.id}&teamAwayId=${event.teamAway.id}&eventName=${event.name}`,
          },
        },
      };
    } else {
      return {
        props: {
          competition: data,
          game,
          metaTagInfo: {
            title: 'Casama - Betting with Friends',
            imageUrl: `/api/betting/metadata/ogImage`,
          },
        },
      };
    }
  } catch (error) {
    console.log(error);
    return {
      props: {
        competition: {},
        metaTagInfo: {
          title: 'Casama - Betting with Friends',
          imageUrl: `/api/betting/metadata/ogImage`,
        },
      },
    };
  }
}
