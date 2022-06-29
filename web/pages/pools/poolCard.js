import { currency } from '/services/formatter';
import { PieChart } from 'react-minimal-pie-chart';
import Link from 'next/link';
import { Paper, Typography } from '@mui/material';
import InitialsAvatar from '/components/utils/initialsAvatar';

export default function PoolCard(props) {
  const { pool } = props;
  const members = pool.members;

  const additionalMembers = (members) => {
    return '+' + (members.length - 3).toString();
  };

  return (
    <Link href={`/pools/${pool.address}?name=${pool.name}`} passHref>
      <Paper
        className="container-white mb-4 pb-6 sm:pb-0 cursor-pointer lg:mb-0 sm:mb-6"
        elevation={1}
        sx={{ p: 2 }}
      >
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <Typography className="text-md">{pool.name}</Typography>
            <div className="bg-white hover:bg-[#ededed]  rounded-md border-2 border-kaico-extra-light-blue p-5 text-md font-semibold cursor-pointer"></div>
          </div>
          <Typography className="text-lg pt-3 font-semibold">
            {currency(pool.totalBalance, {})}
          </Typography>
          <div className="flex flex-row justify-between items-center pb-4">
            <div className="flex flex-row justify-start items-center ">
              <PieChart
                className="w-8 sm:w-6 my-1 mt-6"
                data={[
                  {
                    title: 'One',
                    value: 100 - parseInt(pool.userShare),
                    color: '#E4DFFF',
                  },
                  {
                    title: 'Two',
                    value: parseInt(pool.userShare),
                    color: '#5F45FD',
                  },
                ]}
              />

              <Typography className="text-md  pt-5 pl-3">
                {pool.userShare &&
                  `${parseInt(pool.userShare)}% (${currency(
                    pool.userBalance,
                    {}
                  )})`}
              </Typography>
            </div>

            <div className="flex flex-row   mt-4">
              <div className="flex flex-row">
                {members &&
                  members
                    .sort((a, b) => b.share - a.share)
                    .slice(0, 3)
                    .map((member, i) => {
                      return (
                        <InitialsAvatar
                          key={`member-${i}`}
                          tooltip={`${
                            member.wunderId || 'External User'
                          }: ${parseInt(member.share)}%`}
                          text={member.wunderId ? member.wunderId : '0-X'}
                          separator="-"
                          color={['green', 'blue', 'red', 'teal'][i % 4]}
                        />
                      );
                    })}
              </div>
              {members && members.length > 3 && (
                <div className="flex flex-row">
                  <InitialsAvatar
                    className="text-white"
                    text={additionalMembers(members)}
                    color={'casama'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Paper>
    </Link>
  );
}
