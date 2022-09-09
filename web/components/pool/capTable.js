import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from 'react-icons/md';
import Avatar from '/components/utils/avatar';
import { currency, polyValueToUsd, toFixed } from '/services/formatter';

export default function CapTable(props) {
  const { members, wunderPool } = props;
  const [showMore, setShowMore] = useState(false);

  const visibleMembers = useMemo(() => {
    return members
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, showMore ? members.length : 3);
  }, [showMore, members, wunderPool.poolAddress]);

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
          {visibleMembers.map((member, i) => {
            return (
              <tr key={`member-${i}`}>
                <td className="pb-2">
                  <div className="flex flex-row items-center md:ml-2">
                    <Avatar
                      wunderId={member.wunderId ? member.wunderId : null}
                      tooltip={`${member.wunderId || 'External User'}: ${
                        member.share
                      }%`}
                      text={member.wunderId ? member.wunderId : '0-X'}
                      separator="-"
                      color={['lime', 'pink', 'yellow', 'red', 'blue'][i % 5]}
                      i={i}
                    />
                    <Typography className="ml-1 md:hidden">
                      {member.wunderId ? member.wunderId : 'External User'}
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
                    {currency(
                      member.tokens /
                        wunderPool.governanceToken?.tokensForDollar
                    )}
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
