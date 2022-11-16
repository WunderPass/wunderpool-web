import { Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useCompetition from '/hooks/useCompetition';
import JoinGameCard from '/components/betting/games/joinGameCard';
import { compAddr, showWunderIdsAsIcons } from '/services/memberHelpers';
import CustomHeader from '/components/general/utils/customHeader';
import { useMemo } from 'react';

export default function JoinCompetitionGame(props) {
  const router = useRouter();
  const { user, metaTagInfo, handleInfo, handleError } = props;
  const competition = useCompetition(router.query.competitionId, user);
  const game = useMemo(
    () =>
      competition.isReady
        ? competition?.games?.find((g) => g.id == router.query.gameId)
        : null,
    [competition.isReady]
  );

  const loginCallback = () => {
    router.push(`/betting/bets?sortId=${competition.competition?.id}`);
  };

  useEffect(() => {
    if (competition.isReady) {
      if (game) {
        if (competition.isGameParticipant(game.id)) {
          handleInfo('You already placed a bet for this game');
          loginCallback();
        }
      } else {
        handleInfo('This Bet does not exist');
        router.push('/betting');
      }
    }
  }, [game]);

  // TODO ADD IF BET IS ALREDY FINISHED AN NOT AVAILABLE FOR VOTES
  // useEffect(() => {
  //   if (wunderPool.liquidated) {
  //     handleInfo('This Bet is already resolved');
  //     router.push('/betting');
  //   }
  // }, [wunderPool.liquidated]);

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
        {competition.isReady && (
          <div className="flex flex-col my-8 w-full ">
            <JoinGameCard
              game={game}
              competition={competition}
              secret={router.query.secret}
              user={user}
              {...props}
            />
          </div>
        )}
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
    const event = data?.games?.find((g) => g.id == gameId)?.event;
    if (
      event.teamHome?.name &&
      event.teamAway?.name &&
      event.teamHome?.id &&
      event.teamAway?.id
    ) {
      return {
        props: {
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
        metaTagInfo: {
          title: 'Casama - Betting with Friends',
          imageUrl: `/api/betting/metadata/ogImage`,
        },
      },
    };
  }
}
