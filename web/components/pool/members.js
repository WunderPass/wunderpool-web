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
import { currency } from '/services/formatter';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';

export default function PoolMembers(props) {
  const { wunderPool, loginCallback, handleSuccess } = props;
  const { isReady, isMember, closed, governanceToken, version } = wunderPool;
  const [joinPool, setJoinPool] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const [members, setMembers] = useState(null);
  const [inviteLink, setInviteLink] = useState();
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
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
        className={`flex container-white overflow-clip justify-start md:justify-center ${
          isMember ? 'md:mb-0 mt-6 md:mt-4' : 'mb-4 mt-6 md:mt-6'
        }`}
      >
        <div className="flex flex-col items-start justify-center grow">
          <div className="flex flex-col w-full">
            {!isMember
              ? members && (
                  <>
                    <Typography className="text-xl w-full">Members</Typography>
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
                            color={
                              ['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]
                            }
                          />
                        );
                      })}
                    </div>
                    <Typography className="my-2 sm:mt-4 " variant="h7">
                      {members.length} member(s) are in the pool.
                    </Typography>

                    {closed ? (
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
                  </>
                )
              : isMember
              ? members && (
                  <>
                    <div className="flex flex-row items-end mb-6">
                      <Typography className="my-2 sm:mt-2 text-4xl mr-4">
                        {members.length}
                      </Typography>
                      <Typography className="my-2 sm:mt-2 text-lg">
                        Pool members
                      </Typography>
                    </div>

                    <table className="table-auto">
                      <thead>
                        <tr>
                          <th className="text-left pb-4">
                            <Typography className="opacity-50">
                              Member
                            </Typography>
                          </th>
                          <th className="pb-4">
                            <Typography className="text-left opacity-50 md:text-center">
                              Share
                            </Typography>
                          </th>
                          <th className="text-right pb-4">
                            <Typography className="opacity-50">
                              Invested
                            </Typography>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {members
                          .sort(function (a, b) {
                            return b.tokens > a.tokens;
                          })
                          .map((b, i) => {
                            return (
                              <>
                                {i < 3 && (
                                  <tr>
                                    <td className="pb-2">
                                      <div className="flex flex-row items-center md:ml-2">
                                        <InitialsAvatar
                                          key={`member-${i}`}
                                          tooltip={`${
                                            b.wunderId || 'External User'
                                          }: ${b.share.toString()}%`}
                                          text={b.wunderId ? b.wunderId : '0-X'}
                                          separator="-"
                                          color={
                                            [
                                              'lime',
                                              'pink',
                                              'yellow',
                                              'red',
                                              'blue',
                                            ][i % 5]
                                          }
                                        />
                                        <Typography className="ml-1 md:hidden">
                                          {b.wunderId
                                            ? b.wunderId
                                            : 'External User'}
                                        </Typography>{' '}
                                      </div>
                                    </td>
                                    <td className="pb-2">
                                      <div className="flex flex-row items-center ">
                                        <Typography>
                                          {b.tokens.toString()}
                                        </Typography>
                                        <Typography className="opacity-50 ml-1">
                                          ({b.share.toString()}%)
                                        </Typography>
                                      </div>{' '}
                                    </td>
                                    <td className="text-right pb-2">
                                      <Typography
                                        className="" //TODO CHANGE THIS IN THE FUTURE WHEN THERE IS A GOVTOKENPRICE
                                      >
                                        {currency(
                                          b.tokens.toString() * 0.03,
                                          {}
                                        )}
                                      </Typography>
                                    </td>
                                  </tr>
                                )}

                                {i >= 3 && (
                                  <tr className={showMore ? '' : 'hidden'}>
                                    <td className="pb-2">
                                      <div className="flex flex-row items-center ">
                                        <InitialsAvatar
                                          key={`member-${i}`}
                                          tooltip={`${
                                            b.wunderId || 'External User'
                                          }: ${b.share.toString()}%`}
                                          text={b.wunderId ? b.wunderId : '0-X'}
                                          separator="-"
                                          color={
                                            [
                                              'lime',
                                              'pink',
                                              'yellow',
                                              'red',
                                              'blue',
                                            ][i % 5]
                                          }
                                        />
                                        <Typography className="ml-1">
                                          {b.wunderId
                                            ? b.wunderId
                                            : 'External User'}
                                        </Typography>{' '}
                                      </div>
                                    </td>
                                    <td className="pb-2">
                                      <div className="flex flex-row items-center ">
                                        <Typography>
                                          {b.tokens.toString()}
                                        </Typography>
                                        <Typography className="opacity-50 ml-1">
                                          ({b.share.toString()}%)
                                        </Typography>
                                      </div>{' '}
                                    </td>
                                    <td className="text-right pb-2">
                                      <Typography
                                        className="" //TODO CHANGE THIS IN THE FUTURE WHEN THERE IS A GOVTOKENPRICE
                                      >
                                        {currency(
                                          b.tokens.toString() * 0.03,
                                          {}
                                        )}
                                      </Typography>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                      </tbody>
                    </table>
                    {members.length > 3 && (
                      <>
                        <button
                          className={
                            showMore
                              ? 'flex items-center justify-center text-black text-sm mt-0 opacity-40'
                              : 'hidden items-center justify-center text-black text-sm mt-0 opacity-40'
                          }
                          onClick={toggleShowMore}
                        >
                          <Typography className="text-lg">
                            <MdOutlineKeyboardArrowUp className="ml-3 text-3xl" />
                          </Typography>
                        </button>
                        <button
                          className={
                            showMore
                              ? 'hidden items-center justify-center text-black text-sm mt-0 opacity-40'
                              : 'flex items-center justify-center text-black text-sm mt-0 opacity-40'
                          }
                          onClick={toggleShowMore}
                        >
                          <Typography className="text-lg">
                            <MdOutlineKeyboardArrowDown className="ml-3 text-3xl" />
                          </Typography>
                        </button>
                      </>
                    )}

                    {version.number > 3 && !closed && (
                      <div>
                        <button
                          className="btn-kaico items-center w-full mb-3 mt-3 py-3 px-3 text-md"
                          onClick={() => setInviteMember(true)}
                        >
                          <Typography className="text-lg">
                            Invite Member
                          </Typography>
                        </button>
                        <button className=" btn-neutral items-center w-full py-3 px-3">
                          <CopyToClipboard
                            text={window.location.href}
                            onCopy={() => handleSuccess('Invite link copied!')}
                          >
                            <span className="cursor-pointer">
                              <div className="flex flex-row items-center justify-center">
                                <BsLink45Deg className="text-lg ml-1" />
                                <Typography className="text-lg mr-5 ml-2">
                                  Copy Invite Link
                                </Typography>
                              </div>
                            </span>
                          </CopyToClipboard>
                        </button>
                      </div>
                    )}
                  </>
                )
              : closed && (
                  <div className="-m-5 mt-1 bg-amber-300 text-amber-800 py-2 px-3 flex flex-row items-center justify-center">
                    <FaBan className="text-2xl" />
                    <Typography className="ml-3">
                      You cannot join the Pool as it is closed
                    </Typography>
                  </div>
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
