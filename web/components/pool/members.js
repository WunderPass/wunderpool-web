import { useState, useEffect } from 'react';
import { Skeleton, Typography } from '@mui/material';
import { AiOutlinePlus } from 'react-icons/ai';
import InviteMemberDialog from '/components/dialogs/inviteMember';
import JoinPoolDialog from '/components/dialogs/joinPool';
import Avatar from '/components/members/avatar';
import { FaBan } from 'react-icons/fa';
import CapTable from './capTable';
import InviteLinkButton from './inviteLinkButton';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';
import { getNameFor } from '../../services/memberHelpers';

export default function PoolMembers(props) {
  const { user, wunderPool, loginCallback } = props;
  const { loadingState, isMember, closed, governanceToken, members, version } =
    wunderPool;
  const [open, setOpen] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const handleOpenClose = () => {
    if (open) {
      goBack(() => removeQueryParam('joinPool'));
    } else {
      addQueryParam({ joinPool: 'joinPool' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.joinPool ? true : false);
  }, [router.query]);

  return loadingState.init ? (
    <div className="w-full">
      <div
        className={`flex container-white overflow-clip justify-start md:justify-center`}
      >
        <div className="flex flex-col items-start justify-center grow">
          <div className="flex flex-col w-full">
            <div className="flex flex-row items-end mb-2">
              <Typography className="my-2 sm:mt-2 text-4xl mr-4">
                {members.length}
              </Typography>
              <Typography className="my-2 sm:mt-2 text-lg ">
                Pool members
              </Typography>
            </div>
            {isMember ? (
              <>
                <CapTable members={members} {...props} />
                {version?.number > 3 && !closed && (
                  <div>
                    <button
                      className="btn-casama items-center w-full mb-3 mt-3 py-3 text-md"
                      onClick={() => setInviteMember(true)}
                    >
                      <Typography className="text-lg">Invite Member</Typography>
                    </button>
                    <InviteLinkButton {...props} />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-row flex-wrap w-full">
                  {members.map((member, i) => {
                    return (
                      <Avatar
                        key={`pool-member-${i}`}
                        wunderId={member.wunderId}
                        tooltip={`${getNameFor(
                          member
                        )}: ${member.share.toString()}%`}
                        text={member.wunderId ? member.wunderId : '0-X'}
                        color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
                        i={i}
                      />
                    );
                  })}
                </div>

                {closed ? (
                  <div className="-m-5 mt-3 bg-amber-300 text-amber-800 py-2 px-3 flex flex-row items-center justify-center">
                    <FaBan className="text-2xl" />
                    <Typography className="ml-3">
                      You cannot join the Pool as it is closed
                    </Typography>
                  </div>
                ) : (
                  <button
                    className="btn-casama items-center w-full my-5 py-3 px-3 text-md"
                    onClick={handleOpenClose}
                    disabled={!Boolean(governanceToken)}
                  >
                    <div className="flex flex-row items-center justify-center">
                      <AiOutlinePlus className=" text-xl" />
                      <Typography className="ml-2">Join</Typography>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <InviteMemberDialog
        user={user}
        open={inviteMember}
        setOpen={setInviteMember}
        wunderPool={wunderPool}
        {...props}
      />
      {governanceToken && (
        <JoinPoolDialog
          open={open}
          loginCallback={loginCallback}
          wunderPool={wunderPool}
          {...props}
        />
      )}
    </div>
  ) : (
    <div className="md:ml-4">
      <Skeleton width="100%" height={100} />
    </div>
  );
}
