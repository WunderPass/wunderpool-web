import axios from 'axios';

export function getNameFor(member = {}) {
  return member.firstName && member.lastName
    ? `${member.firstName} ${member.lastName}`
    : member.wunder_id || member.wunderId || 'External User';
}

export async function searchMembers(query) {
  const { data } = await axios({
    url: '/api/proxy/users/search',
    params: { query: query },
  });
  return data.map((member) => ({
    email: member.email,
    handle: member.handle,
    firstName: member.firstname,
    lastName: member.lastname,
    phoneNumber: member.phone_number,
    address: member.wallet_address,
    wunderId: member.wunder_id,
  }));
}
