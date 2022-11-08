import axios from 'axios';
import { ethProvider } from '/services/contract/provider';

export function getNameFor(member = {}) {
  return member.firstName && member.lastName
    ? `${member.firstName} ${member.lastName}`
    : member.wunder_id || member.wunderId || 'External User';
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
