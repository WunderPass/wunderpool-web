import { currency } from '/services/formatter';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import Link from 'next/link';
import { Divider, Paper, Typography } from '@mui/material';
import Avatar from '/components/general/members/avatar';
import InitialsAvatar from '/components/general/members/initialsAvatar';
import { cacheImageByURL } from '/services/caching';
import { getNameFor } from '/services/memberHelpers';
import axios from 'axios';

export default function PoolCard(props) {
  const { pool } = props;
  const [imageUrl, setImageUrl] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const members = pool.members;

  useEffect(async () => {
    setImageUrl(null);
    if (!pool.address) return;
    // getInviteLinkFromAddress(pool.address);
    setImageUrl(
      await cacheImageByURL(
        `pool_image_${pool.address}`,
        `/api/pools/metadata/getImage?address=${pool.address}`,
        600
      )
    );
  }, [pool.address]);

  const getInviteLinkFromAddress = async (address) => {
    axios({
      method: 'get',
      url: `/api/pools/public/find?address=${address}`,
    }).then((res) => {
      const [pool] = [...res.data];
      setInviteLink(pool.inviteLink);
    });
  };

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden sm:flex w-full">
        <Link href={`/investing/pools/${pool.address}`} passHref>
          <Paper
            className="container-white cursor-pointer lg:mb-0 sm:mb-6 relative overflow-hidden w-full"
            elevation={1}
            sx={{ p: 2 }}
          >
            <div className="flex flex-row items-center justify-between relative ">
              <div className="flex flex-row justify-between items-center w-2/5 md:w-5/6 lg:w-full">
                <div className="flex flex-row items-center justify-start w-52 md:w-auto">
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
                  <div className="text-md font-medium pl-4 trunacte ... ">
                    {pool.name}
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between items-center w-full ">
                <Typography className="text-lg font-medium pl-5">
                  {currency(pool.totalBalance)}
                </Typography>
                <div className="flex flex-row mr-0 md:mr-4">
                  <div className="flex flex-row ">
                    {members &&
                      members
                        .sort((a, b) => b.share - a.share)
                        .slice(0, 3)
                        .map((member, i) => {
                          return (
                            <Avatar
                              key={`avatar-${pool.address}-${i}`}
                              wunderId={member.wunderId}
                              tooltip={`${getNameFor(
                                member
                              )}: ${member.share.toFixed(0)}%`}
                              text={member.wunderId ? member.wunderId : '0-X'}
                              color={['green', 'blue', 'red'][i % 3]}
                              i={i}
                            />
                          );
                        })}
                  </div>
                  {members && members.length > 3 && (
                    <div className="flex flex-row">
                      <InitialsAvatar
                        text={`+${members.length - 3}`}
                        color={'powder'}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden md:flex flex-row items-center justify-center lg:w-2/3 md:w-4/5 ">
                <div className="flex flex-row items-center container-gray-p-0 p-3 px-5  hover:bg-gray-300">
                  <div className="text-base font-medium">
                    {pool.members?.length} /{' '}
                    {pool.shareholderAgreement?.maxMembers} members
                  </div>
                  <Divider
                    className=" mx-3"
                    flexItem={true}
                    orientation="vertical"
                  />
                  <div className="text-base font-medium">Join</div>
                </div>
              </div>
            </div>
          </Paper>
        </Link>
      </div>

      {/* MOBILE VIEW  */}
      <div className="sm:hidden flex w-full">
        <Link href={inviteLink} passHref>
          <Paper
            className="container-white mb-4 pb-6 sm:pb-0 cursor-pointer lg:mb-0 sm:mb-6 relative overflow-hidden w-full"
            elevation={1}
            sx={{ p: 2 }}
          >
            <div className="flex flex-col relative">
              <div className="flex flex-row justify-between items-center">
                <Typography className="text-md font-medium">
                  {pool.name}
                </Typography>
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
              <div className="flex flex-row justify-between items-center pb-3 -ml-1">
                <div className="flex flex-row items-center container-gray-p-0 p-3 px-6 mt-5 hover:bg-gray-300">
                  <div className="text-base font-medium">
                    {pool.members?.length} /{' '}
                    {pool.shareholderAgreement?.maxMembers}
                  </div>
                  <Divider
                    className=" mx-2"
                    flexItem={true}
                    orientation="vertical"
                  />
                  <div className="text-base font-medium">Join</div>
                </div>

                <div className="flex flex-row mt-4">
                  <div className="flex flex-row">
                    {members &&
                      members
                        .sort((a, b) => b.share - a.share)
                        .slice(0, 3)
                        .map((member, i) => {
                          return (
                            <Avatar
                              key={`avatar-${pool.address}-${i}`}
                              wunderId={member.wunderId}
                              tooltip={`${getNameFor(
                                member
                              )}: ${member.share.toFixed(0)}%`}
                              text={member.wunderId ? member.wunderId : '0-X'}
                              color={['green', 'blue', 'red'][i % 3]}
                              i={i}
                            />
                          );
                        })}
                  </div>
                  {members && members.length > 3 && (
                    <div className="flex flex-row">
                      <InitialsAvatar
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
      </div>
    </>
  );
}
