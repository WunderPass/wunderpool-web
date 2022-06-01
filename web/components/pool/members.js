import axios from 'axios';
import { useState, useEffect } from 'react';
import { Skeleton, Tooltip, Typography } from '@mui/material';
import { AiOutlinePlus } from 'react-icons/ai';
import InviteMemberDialog from '/components/dialogs/inviteMember';
import JoinPoolDialog from '/components/dialogs/joinPool';
import InitialsAvatar from '../utils/initialsAvatar';

export default function PoolMembers(props) {
  const { wunderPool, loginCallback } = props;
  const { isReady, isMember, governanceToken } = wunderPool;
  const [joinPool, setJoinPool] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const [members, setMembers] = useState(null);

  useEffect(async () => {
    if (governanceToken && governanceToken.holders) {
      const resolvedMembers = await Promise.all(
        governanceToken.holders.map(async (mem) => {
          try {
            const user = await axios({
              url: '/api/proxy/users/find',
              params: { address: mem.address },
            });
            return { ...mem, wunderId: user.data.wunderId };
          } catch {
            return mem;
          }
        })
      );
      setMembers(resolvedMembers);
    }
  }, [governanceToken]);

  return isReady ? (
    <div className="md:ml-4">
      <div
        className={`flex container-white justify-start md:justify-center mb-4 ${
          isMember ? 'md:mb-0 mt-6 md:mt-4' : 'mb-4 mt-6 md:mt-6'
        }`}
      >
        <div className="flex flex-col items-center justify-center ">
          <Typography className="text-xl w-full">Members</Typography>
          <div className="flex flex-col ">
            {members && (
              <>
                <div className="flex flex-row flex-wrap w-full mt-2">
                  {members.map((member, i) => {
                    return (
                      <InitialsAvatar
                        key={`member-${i}`}
                        tooltip={`${member.share.toString()}%`}
                        text={member.wunderId ? member.wunderId : '0-X'}
                        separator="-"
                        color={['red', 'green', 'blue'][i % 3]}
                      />
                    );
                  })}
                </div>
                <Typography className="my-2 sm:mt-4 " variant="h7">
                  {members.length} members are in the pool.
                </Typography>
              </>
            )}
            {isMember ? (
              wunderPool.version.number > 3 &&
              !wunderPool.closed && (
                <button
                  className="btn-kaico items-center w-full my-5 py-3 px-3 text-md"
                  onClick={() => setInviteMember(true)}
                >
                  <Typography className="text-lg">Invite Member</Typography>
                </button>
              )
            ) : (
              <button
                className="btn-kaico items-center w-full my-5 py-3 px-3 text-md"
                onClick={() => setJoinPool(true)}
                disabled={!Boolean(wunderPool.governanceToken)}
              >
                <div className="flex flex-row items-center justify-center">
                  <AiOutlinePlus className=" text-xl" />
                  <Typography className="ml-2">Join</Typography>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      <InviteMemberDialog
        open={inviteMember}
        setOpen={setInviteMember}
        wunderPool={wunderPool}
        {...props}
      />
      {wunderPool.governanceToken && (
        <JoinPoolDialog
          open={joinPool}
          setOpen={setJoinPool}
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
