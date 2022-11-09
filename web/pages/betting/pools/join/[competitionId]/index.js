import { Container } from '@mui/material';

export default function JoinCompetition(props) {
  return (
    <>
      <Container
        className="flex flex-col justify-center items-center gap-3"
        maxWidth="xl"
      >
        <p className="mt-28">Tournament Mode is coming Soon!</p>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const { competitionId } = context.query;

  try {
    const data = await (
      await fetch(
        `https://app.casama.io/api/betting/competitions/show?id=${competitionId}`
      )
    ).json();

    if (!data) {
      return {
        redirect: {
          permanent: false,
          destination: `/betting/pools`,
        },
      };
    } else if (data.games.length == 1) {
      return {
        redirect: {
          permanent: false,
          destination: `/betting/pools/join/${competitionId}/${data.games[0].id}`,
        },
      };
    }

    return {
      props: {
        metaTagInfo: {
          title: `Casama - Tournament Mode Coming Soon`,
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
