import { Skeleton, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from 'react-icons/md';
import { getNameFor } from '/services/memberHelpers';
import Avatar from '/components/general/members/avatar';
import { currency, polyValueToUsd, toFixed } from '/services/formatter';
import { getEnsNameFromAddress } from '/services/memberHelpers';

export default function CapTable(props) {
  const { members, wunderPool } = props;
  const [showMore, setShowMore] = useState(false);

  const visibleMembers = useMemo(() => {
    return members
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, showMore ? members.length : 3);
  }, [showMore, members, wunderPool.poolAddress]);

  if (!wunderPool.loadingState.members) return <SkeletonCapTable />;

  return (
    <>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="text-left pb-4">
              <Typography className="opacity-50">Member</Typography>
            </th>
            <th className="pb-4">
              <Typography className="text-left opacity-50 md:text-center">
                Share
              </Typography>
            </th>
            <th className="text-right pb-4">
              <Typography className="opacity-50">Stake</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleMembers.map((member, i) => {
            return (
              <tr key={`member-${i}`}>
                <td className="pb-2">
                  <div className="flex flex-row items-center md:ml-2">
                    <Avatar
                      wunderId={member.wunderId}
                      tooltip={`${getNameFor(member)}: ${toFixed(
                        member.share,
                        2
                      )}%`}
                      text={member.userName ? member.userName : '0X'}
                      i={i}
                    />

                    <Typography className="ml-1 md:hidden">
                      {member.userName ? member.userName : 'External User'}
                    </Typography>
                  </div>
                </td>
                <td className="pb-2">
                  <div className="flex flex-row items-center lg:ml-16">
                    <Typography>{toFixed(member.tokens, 2)}</Typography>
                    <Typography className="opacity-50 ml-1">
                      ({toFixed(member.share, 2)}%)
                    </Typography>
                  </div>
                </td>

                <td className="text-right pb-2">
                  <Typography className="">
                    {currency((member.share * wunderPool.usdcBalance) / 100)}
                  </Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {members.length > 3 && (
        <button
          className="flex items-center justify-center text-black text-sm mt-0 opacity-40"
          onClick={() => setShowMore((val) => !val)}
        >
          <Typography className="text-lg">
            {showMore ? (
              <MdOutlineKeyboardArrowUp className="ml-3 text-3xl" />
            ) : (
              <MdOutlineKeyboardArrowDown className="ml-3 text-3xl" />
            )}
          </Typography>
        </button>
      )}
    </>
  );
}

function SkeletonCapTable() {
  return (
    <>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="text-left pb-4">
              <Typography className="opacity-50">Member</Typography>
            </th>
            <th className="pb-4">
              <Typography className="text-left opacity-50 md:text-center">
                Share
              </Typography>
            </th>
            <th className="text-right pb-4">
              <Typography className="opacity-50">Invested</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pb-2">
              <div className="flex flex-row items-center md:ml-2">
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </td>
            <td className="pb-2">
              <div className="flex flex-row items-center">
                <Skeleton className="w-full" />
              </div>
            </td>
            <td className="text-right pb-2">
              <Skeleton className="w-[70%] inline-block" />
            </td>
          </tr>
          <tr>
            <td className="pb-2">
              <div className="flex flex-row items-center md:ml-2">
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </td>
            <td className="pb-2">
              <div className="flex flex-row items-center">
                <Skeleton className="w-full" />
              </div>
            </td>
            <td className="text-right pb-2">
              <Skeleton className="w-[70%] inline-block" />
            </td>
          </tr>
          <tr>
            <td className="pb-2">
              <div className="flex flex-row items-center md:ml-2">
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </td>
            <td className="pb-2">
              <div className="flex flex-row items-center">
                <Skeleton className="w-full" />
              </div>
            </td>
            <td className="text-right pb-2">
              <Skeleton className="w-[70%] inline-block" />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
