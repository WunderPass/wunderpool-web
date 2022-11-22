import { currency } from '/services/formatter';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import Link from 'next/link';
import { Paper, Typography, Divider } from '@mui/material';
import Avatar from '/components/general/members/avatar';
import InitialsAvatar from '/components/general/members/initialsAvatar';
import { cacheImageByURL } from '/services/caching';
import { getNameFor } from '/services/memberHelpers';

export default function PoolCard(props) {
  const { pool, isPublic } = props;
  const [imageUrl, setImageUrl] = useState(false);
  const members = pool.members;

  useEffect(async () => {
    setImageUrl(null);
    if (!pool.address) return;
    setImageUrl(
      await cacheImageByURL(
        `pool_image_${pool.address}`,
        `/api/pools/metadata/getImage?address=${pool.address}`,
        600
      )
    );
  }, [pool.address]);

  return (
    <Link href={`/investing/pools/${pool.address}`} passHref>
      <Paper
        className="container-white mb-4 pb-6 sm:pb-0 cursor-pointer lg:mb-0 sm:mb-6 relative overflow-hidden w-full"
        elevation={1}
        sx={{ p: 2 }}
      >
        <div className="flex flex-col relative">
          <div className="flex flex-row justify-between items-center">
            <Typography className="text-md font-medium">{pool.name}</Typography>
            <div
              className={`bg-white hover:bg-[#ededed] rounded-md border-casama-extra-light-blue text-md font-medium cursor-pointer ${
                imageUrl ? '' : 'p-6 border-2'
              }`}
            >
              {imageUrl && (
                <img
                  className="object-cover w-12 h-12 rounded-md"
                  src={imageUrl}
                  type="file"
                />
              )}
            </div>
          </div>
          <Typography className="text-lg pt-3 ">
            {currency(pool.totalBalance)}
          </Typography>
          <div className="flex flex-row justify-between items-center pb-3">
            {isPublic ? (
              <div className="flex flex-row items-center container-gray-p-0 p-3 px-6 mt-5 hover:bg-gray-300">
                <div className="text-base font-medium">
                  {pool.members?.length} /{' '}
                  {pool.shareholderAgreement.maxMembers}
                </div>
                <Divider
                  className=" mx-3"
                  flexItem={true}
                  orientation="vertical"
                />
                <div className="text-base font-medium">Join</div>
              </div>
            ) : (
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
                      pool.userBalance
                    )})`}
                </Typography>
              </div>
            )}

            <div className="flex flex-row mt-4">
              <div className="flex flex-row">
                {members &&
                  members
                    .sort((a, b) => b.share - a.share)
                    .slice(0, 3)
                    .map((member, i) => {
                      return (
                        <Avatar
                          shiftRight
                          key={`avatar-${pool.address}-${member.address}`}
                          wunderId={member.wunderId}
                          tooltip={`${getNameFor(
                            member
                          )}: ${member.share.toFixed(0)}%`}
                          text={member.userName ? member.userName : '0X'}
                          i={i}
                        />
                      );
                    })}
              </div>
              {members && members.length > 3 && (
                <div className="flex flex-row">
                  <InitialsAvatar
                    shiftRight
                    text={`+${members.length - 3}`}
                    color={'powder'}
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
