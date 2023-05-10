import { Container, Divider } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MultiCard from '../../../../components/betting/multi/multiCard';
import AuthenticateWithCasama from '../../../../components/general/auth/authenticateWithCasama';
import LoginWithMetaMask from '../../../../components/general/auth/loginWithMetaMask';
import LoginWithWalletConnect from '../../../../components/general/auth/loginWithWalletConnect';
import CustomHeader from '../../../../components/general/utils/customHeader';
import { UseBettingService } from '../../../../hooks/useBettingService';
import { UseNotification } from '../../../../hooks/useNotification';
import { LoginMethod, UseUserType } from '../../../../hooks/useUser';
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
  const { user, competition, metaTagInfo, handleError } = props;

  const handleLogin = (data: LoginParams) => {
    user.updateLoginMethod(data.loginMethod);
    user.updateWunderId(data.wunderId);
    user.updateAddress(data.address);
  };

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
          {user?.loggedIn ? (
            user?.usdBalance < competition.stake ? (
              <TopUpRequired />
            ) : (
              <MultiCard competition={competition} {...props} />
            )
          ) : (
            <NotLoggedIn handleLogin={handleLogin} handleError={handleError} />
          )}
        </div>
      </Container>
    </>
  );
}

type LoginParams = {
  loginMethod: LoginMethod;
  wunderId: string;
  address: string;
};

type NotLoggedInProps = {
  handleLogin: (data: LoginParams) => void;
  handleError: UseNotification.handleError;
};

function NotLoggedIn({ handleLogin, handleError }: NotLoggedInProps) {
  return (
    <div className="flex flex-col justify-center items-center max-w-xs mx-auto w-full">
      <p className="text-sm text-center">Sign Up or Login to join this Bet</p>
      <Divider className=" mb-4 opacity-70" />
      <AuthenticateWithCasama onSuccess={handleLogin} />
      <p className="text-gray-400 text-sm my-2 mb-1 lg:mb-1 mt-4">
        Already have a wallet?
      </p>
      <div className="max-w-xs w-full mb-4 ">
        <LoginWithMetaMask onSuccess={handleLogin} handleError={handleError} />
        <LoginWithWalletConnect onSuccess={handleLogin} />
      </div>
    </div>
  );
}

function TopUpRequired() {
  return (
    <div className="flex flex-col justify-center items-center">
      <p className="text-sm mt-3">
        To continue, your Account needs more funds.
      </p>
      <p className="text-xl my-3">Deposit funds to your wallet</p>
      <Link href="/balance">
        <a className="w-full max-w-sm">
          <button className="btn-casama p-3 w-full">Deposit now</button>
        </a>
      </Link>
    </div>
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
