import { currency } from '/services/formatter';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Divider } from '@mui/material';
import Avatar from '/components/general/members/avatar';
import InitialsAvatar from '/components/general/members/initialsAvatar';
import { cacheImageByURL } from '/services/caching';
import { getNameFor } from '/services/memberHelpers';

export default function PoolCard(props) {
  const { pool } = props;
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
    <Link href={`/betting/pools/${pool.address}`} passHref>
      <div className="container-white w-full flex flex-col sm:flex-row justify-between p-3 gap-3 cursor-pointer">
        <div className="flex flex-row-reverse sm:flex-row w-full sm:max-w-[40%] items-center justify-between sm:justify-start gap-3">
          <div
            className={`bg-white hover:bg-[#ededed] rounded-md border-casama-extra-light-blue text-md font-medium ${
              imageUrl ? '' : 'p-6 border-2'
            }`}
          >
            {imageUrl && (
              <img
                className="object-cover w-12 min-w-[3rem] aspect-square rounded-md"
                src={imageUrl}
                type="file"
              />
            )}
          </div>
          <p className="text-md font-medium truncate">{pool.name}</p>
        </div>
        <div className="w-full flex justify-start items-center sm:w-auto mb-2 sm:mb-0 text-lg">
          {currency(pool.totalBalance)}
        </div>
        <div className="flex flex-row-reverse sm:flex-row w-full sm:max-w-[50%] items-center justify-between sm:justify-end gap-3">
          <div className="flex flex-row">
            {members &&
              members
                .sort((a, b) => b.share - a.share)
                .slice(0, 3)
                .map((member, i) => {
                  return (
                    <Avatar
                      shiftRight
                      key={`avatar-${pool.address}-${i}`}
                      wunderId={member.wunderId}
                      tooltip={`${getNameFor(member)}: ${member.share.toFixed(
                        0
                      )}%`}
                      text={member.wunderId ? member.wunderId : '0-X'}
                      color={['green', 'blue', 'red'][i % 3]}
                      i={i}
                    />
                  );
                })}
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
          <div className="flex flex-row items-center container-gray-p-0 p-3 px-5 hover:bg-gray-300">
            <div className="text-base font-medium">
              {pool.members?.length} / {pool.shareholderAgreement?.maxMembers}{' '}
              Members
            </div>
            <Divider className="mx-3" flexItem={true} orientation="vertical" />
            <div className="text-base font-medium">Join</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
