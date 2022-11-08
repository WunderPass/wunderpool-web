import { Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useGame from '/hooks/useGame';
import JoinGameCard from '/components/betting/games/joinGameCard';
import CustomHeader from '/components/general/utils/customHeader';

export default function JoinPool(props) {
  const router = useRouter();
  const { user, metaTagInfo, handleInfo, handleError } = props;
  const game = useGame(router.query.id, user);

  const loginCallback = () => {
    router.push(`/betting/bets?sortId=${game.game.id}`); //TODO add sortId in for bets (check /pools?sortId=27)
  };

  useEffect(() => {
    if (game.isReady) {
      if (game.exists) {
        if (game.isParticipant) {
          handleInfo('You already placed a bet for this game');
          loginCallback();
        }
      } else {
        handleInfo('This Bet does not exist');
        router.push('/betting/pools');
      }
    }
  }, [game.isReady, game.isParticipant]);

  // TODO ADD IF BET IS ALREDY FINISHED AN NOT AVAILABLE FOR VOTES
  // useEffect(() => {
  //   if (wunderPool.liquidated) {
  //     handleInfo('This Bet is already resolved');
  //     router.push('/betting/pools');
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
        {game.isReady && (
          <div className="flex flex-col my-8 w-full ">
            <JoinGameCard
              key={`dashboard-game-card-${game.game.id}`}
              game={game.game}
              user={user}
              handleInfo={handleInfo}
              handleError={handleError}
              {...props}
            />
          </div>
        )}
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const id = context.query.id;

  try {
    const data = await (
      await fetch(`https://app.casama.io/api/betting/games?gameId=${id}`)
    ).json();
    const event = data[0]?.event;
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
