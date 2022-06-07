import axios from 'axios';
import { useState, useEffect } from 'react';
import { Skeleton, Typography } from '@mui/material';
import { AiOutlinePlus } from 'react-icons/ai';
import InviteMemberDialog from '/components/dialogs/inviteMember';
import JoinPoolDialog from '/components/dialogs/joinPool';
import InitialsAvatar from '../utils/initialsAvatar';
import { FaBan } from 'react-icons/fa';
import { BsLink45Deg } from 'react-icons/bs';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function PoolMembers(props) {
  const { wunderPool, loginCallback, handleSuccess } = props;
  const { isReady, isMember, closed, governanceToken, version } = wunderPool;
  const [joinPool, setJoinPool] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const [members, setMembers] = useState(null);
  const [inviteLink, setInviteLink] = useState();

  const copyInviteLink = () => {
    setInviteLink(window.location.href);
  };

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
        className={`flex container-white overflow-clip justify-start md:justify-center mb-4 ${
          isMember ? 'md:mb-0 mt-6 md:mt-4' : 'mb-4 mt-6 md:mt-6'
        }`}
      >
        <div className="flex flex-col items-start justify-center grow">
          <Typography className="text-xl w-full">Members</Typography>
          <div className="flex flex-col w-full">
            {members && (
              <>
                <div className="flex flex-row flex-wrap w-full mt-2">
                  {members.map((member, i) => {
                    return (
                      <InitialsAvatar
                        key={`member-${i}`}
                        tooltip={`${
                          member.wunderId || 'External User'
                        }: ${member.share.toString()}%`}
                        text={member.wunderId ? member.wunderId : '0-X'}
                        separator="-"
                        color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
                      />
                    );
                  })}
                </div>
                <Typography className="my-2 sm:mt-4 " variant="h7">
                  {members.length} member(s) are in the pool.
                </Typography>
              </>
            )}
            {isMember ? (
              version.number > 3 &&
              !closed && (
                <div>
                  <button
                    className="btn-kaico items-center w-full mb-3 mt-3 py-3 px-3 text-md"
                    onClick={() => setInviteMember(true)}
                  >
                    <Typography className="text-lg">Invite Member</Typography>
                  </button>
                  <button className=" btn-neutral items-center w-full py-3 px-3">
                    <CopyToClipboard
                      text={window.location.href}
                      onCopy={() => handleSuccess('Invite link copied!')}
                    >
                      <span className="cursor-pointer">
                        <div className="flex flex-row items-center justify-between">
                          <BsLink45Deg className="text-lg ml-1" />
                          <Typography className="text-lg mr-5">
                            Copy Invite Link
                          </Typography>
                        </div>
                      </span>
                    </CopyToClipboard>
                  </button>
                </div>
              )
            ) : closed ? (
              <div className="-m-5 mt-1 bg-amber-300 text-amber-800 py-2 px-3 flex flex-row items-center justify-center">
                <FaBan className="text-2xl" />
                <Typography className="ml-3">
                  You cannot join the Pool as it is closed
                </Typography>
              </div>
            ) : (
              <button
                className="btn-kaico items-center w-full my-5 py-3 px-3 text-md"
                onClick={() => setJoinPool(true)}
                disabled={!Boolean(governanceToken)}
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
      {governanceToken && (
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
