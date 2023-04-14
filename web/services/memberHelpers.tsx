import axios from 'axios';
import { ethProvider } from './contract/provider';
import Avatar from '../components/general/members/avatar';
import InitialsAvatar from '../components/general/members/initialsAvatar';
import { UserSearchResponse } from '../pages/api/users/search';
import { UserGetFriendsResponse } from '../pages/api/users/getFriends';

export function getNameFor(member: any = {}): string {
  return (member.firstName || member.firstname) &&
    (member.lastName || member.lastname)
    ? `${member.firstName || member.firstname} ${
        member.lastName || member.lastname
      }`
    : member.userName || member.handle || member.wunderId || 'External User';
}

export function showWunderIdsAsIcons(
  arr: { wunderId: string; userName: string }[],
  amount = 3
) {
  if (arr.length < 1) return null;
  return (
    <>
      {arr.slice(0, amount).map(({ wunderId, userName }, i) => (
        <Avatar
          key={`member-avatar-${wunderId}`}
          shiftRight
          wunderId={wunderId}
          text={userName ? userName : '0X'}
          tooltip={userName ? userName : 'user'}
          i={i}
        />
      ))}
      {arr && arr.length > amount && (
        <InitialsAvatar
          shiftRight
          text={`+${arr.length - amount}`}
          color={'powder'}
        />
      )}
    </>
  );
}

export async function getEnsNameFromAddress(address: string) {
  if (!address) return;
  var name = await ethProvider.lookupAddress(address);
  return name;
}

export type FormattedUser = {
  email: string;
  handle: string;
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber: string;
  address: string;
  wunderId: string;
};

export function formatUser(member: UserSearchResponse[number]): FormattedUser {
  return {
    email: member.email,
    handle: member.handle,
    firstName: member.firstname,
    lastName: member.lastname,
    userName: member.handle,
    phoneNumber: member.phone_number,
    address: member.wallet_address,
    wunderId: member.wunder_id,
  };
}

export async function searchMembers(query: string) {
  const { data }: { data: UserSearchResponse } = await axios({
    url: '/api/users/search',
    params: { query },
  });
  return data.map(formatUser);
}

export async function fetchUserFriends(wunderId: string) {
  if (!wunderId) return [];
  const { data }: { data: UserGetFriendsResponse } = await axios({
    url: '/api/users/getFriends',
    params: { wunderId },
  });
  return data.map(formatUser);
}

export function compAddr(addr1: string, addr2: string) {
  return addr1?.toLowerCase() == addr2?.toLowerCase();
}
