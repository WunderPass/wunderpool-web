import axios from 'axios';
import { useState, useEffect } from 'react';
import { Skeleton, Typography } from '@mui/material';
import { AiOutlinePlus } from 'react-icons/ai';
import InviteMemberDialog from '/components/dialogs/inviteMember';
import JoinPoolDialog from '/components/dialogs/joinPool';
import InitialsAvatar from '../utils/initialsAvatar';
import { FaBan } from 'react-icons/fa';
import { BsLink45Deg } from 'react-icons/bs';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default async function normalTrx(props) {
  const { wunderPool } = props;
  const { isReady, isMember, closed, governanceToken, version } = wunderPool;
  const [joinPool, setJoinPool] = useState(false);
  const [inviteMember, setInviteMember] = useState(false);
  const [members, setMembers] = useState(null);
  const [inviteLink, setInviteLink] = useState();

  const copyInviteLink = () => {
    setInviteLink(window.location.href);
  };

  return isReady ? (
    <div></div>
  ) : (
    <div className="md:ml-4">
      <Skeleton width="100%" height={100} />
    </div>
  );
}
