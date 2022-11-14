import axios from 'axios';
import { ethProvider } from '/services/contract/provider';
import Avatar from '/components/general/members/avatar';
import InitialsAvatar from '/components/general/members/initialsAvatar';

export function getNameFor(member = {}) {
  return member.firstName && member.lastName
    ? `${member.firstName} ${member.lastName}`
    : member.wunder_id || member.wunderId || 'External User';
}

export function showWunderIdsAsIcons(arr, amount = 3) {
  if (arr.length < 1)
    return (
      <>
        <InitialsAvatar shiftRight text={`+${0}`} color={'powder'} />
      </>
    );
  return (
    <>
      {arr.slice(0, amount).map((wunderId, i) => (
        <Avatar
          key={`member-avatar-${wunderId}`}
          shiftRight
          wunderId={wunderId}
          text={wunderId ? wunderId : '0-X'}
          tooltip={wunderId}
          color={['green', 'blue', 'red'][i % 3]}
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

export async function getEnsNameFromAddress(address) {
  if (!address) return;
  var name = await ethProvider.lookupAddress(address);
  return name;
}

function formatMember(member) {
  return {
    email: member.email,
    handle: member.handle,
    firstName: member.firstname,
    lastName: member.lastname,
    phoneNumber: member.phone_number,
    address: member.wallet_address,
    wunderId: member.wunder_id,
  };
}

export async function searchMembers(query) {
  const { data } = await axios({
    url: '/api/users/search',
    params: { query },
  });
  return data.map(formatMember);
}

export async function fetchUserFriends(wunderId) {
  if (!wunderId) return [];
  const { data } = await axios({
    url: '/api/users/getFriends',
    params: { wunderId },
  });
  return data.map(formatMember);
}

export function compAddr(addr1, addr2) {
  return addr1?.toLowerCase() == addr2?.toLowerCase();
}
