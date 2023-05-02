import { useEffect, useState } from 'react';
import { Collapse, Container, Divider, Menu, MenuItem } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { usdcBalanceOf } from '../../services/contract/token';
import { currency } from '../../services/formatter';
import { compAddr, getNameFor } from '../../services/memberHelpers';
import { RiUserSearchLine } from 'react-icons/ri';
import { cacheItemDB, getCachedItemDB } from '../../services/caching';
import { AiOutlineMail } from 'react-icons/ai';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaCopy, FaFileCsv } from 'react-icons/fa';
import copyToClipboard from '../../services/shareLink';
import { UseUserType } from '../../hooks/useUser';
import { UseNotification } from '../../hooks/useNotification';
import { AllUsersResponse } from '../api/users/all';

type UserData = AllUsersResponse[0] & { usdBalance: number };

type AdminRewardsPageProps = {
  user: UseUserType;
  handleSuccess: UseNotification.handleSuccess;
};

export default function AdminRewardsPage(props: AdminRewardsPageProps) {
  const { user, handleSuccess } = props;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<AllUsersResponse>([]);
  const [userData, setUserData] = useState<UserData[]>([]);

  const fetchUserData = async () => {
    setLoading(true);
    const { data }: { data: AllUsersResponse } = await axios({
      url: '/api/users/all',
    });
    setLoading(false);
    setAllUsers(data);
  };

  useEffect(() => {
    setUserData([]);
    if (allUsers.length > 0) {
      allUsers.forEach(async (usr) => {
        const usdBalance =
          (await getCachedItemDB(`${usr.wallet_address}_usdc_balance`)) ||
          (await cacheItemDB(
            `${usr.wallet_address}_usdc_balance`,
            await usdcBalanceOf(usr.wallet_address, 'polygon'),
            600
          ));
        setUserData((data) => [...data, { ...usr, usdBalance }]);
      });
    }
  }, [allUsers.length]);

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/betting/multi');
      } else {
        fetchUserData();
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl">
      <div className="flex flex-col gap-3 mt-5">
        <h1 className="text-xl font-semibold text-center relative">
          User Tracking
        </h1>
        {loading ? (
          <h3 className="text-center text-3xl">Ladet...</h3>
        ) : (
          <>
            <CopyEmailsButton
              userData={userData}
              handleSuccess={handleSuccess}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="textfield p-2"
            />
            {userData
              .filter((u) =>
                `${u.firstname} ${u.lastname} ${u.handle} ${u.email} ${u.wunder_id}`.match(
                  new RegExp(search)
                )
              )
              .sort((a, b) => a.usdBalance - b.usdBalance)
              .map((usr) => {
                return (
                  <UserRow
                    key={`user-data-${usr.wunder_id}`}
                    user={usr}
                    handleSuccess={handleSuccess}
                  />
                );
              })}
          </>
        )}
      </div>
    </Container>
  );
}

type UserRowProps = {
  user: UserData;
  handleSuccess: UseNotification.handleSuccess;
};

function UserRow({ user, handleSuccess }: UserRowProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  const getDetailsFor = async () => {
    setLoading(true);
    const { data } = await axios({
      url: `/api/betting/competitions`,
      params: {
        userAddress: user.wallet_address,
        states: 'UPCOMING,LIVE,HISTORIC',
        sort: 'endTimestamp,desc',
        size: 150,
      },
    });
    setDetails({ competitions: data.content });
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg px-3 py-2">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex gap-1">
          <p>{getNameFor(user)}</p>
          {!details && (
            <button
              onClick={getDetailsFor}
              className="btn-casama p-1 text-lg"
              disabled={loading}
            >
              <RiUserSearchLine />
            </button>
          )}
          {user.email && (
            <CopyToClipboard
              text={user.email}
              onCopy={() => handleSuccess('Copied Email')}
            >
              <button className="btn-casama p-1 text-lg">
                <AiOutlineMail />
              </button>
            </CopyToClipboard>
          )}
        </div>
        <div className="flex gap-1">
          <p>{currency(user.usdBalance)}</p>
        </div>
      </div>
      <Collapse in={Boolean(details)}>
        <Divider className="my-1" />
        <p>Competitions: {details?.competitions?.length}</p>
        <p>
          Profit/Loss:{' '}
          {currency(
            details?.competitions
              ?.map(
                (c) =>
                  c.members.find(({ address }) =>
                    compAddr(address, user.wallet_address)
                  )?.profit || 0
              )
              .reduce((a, b) => a + b, 0)
          )}
        </p>
      </Collapse>
    </div>
  );
}

type CopyEmailsButtonProps = {
  userData: UserData[];
  handleSuccess: UseNotification.handleSuccess;
};

function CopyEmailsButton({ userData, handleSuccess }: CopyEmailsButtonProps) {
  const [anchorEl, setAnchorEl] = useState<Element>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyEmails = () => {
    const emails = userData
      .map((u) => (Number(u.usdBalance) <= 1 && u.email ? u.email : null))
      .filter((email) => email);
    copyToClipboard(emails.join(';'));
    handleSuccess(`Copied ${emails.length} Emails`);
    handleClose();
  };

  const handleEmailsCsv = () => {
    const users = userData
      .map((u) =>
        Number(u.usdBalance) <= 1 && u.email
          ? [u.firstname || u.handle, u.email]
          : null
      )
      .filter((usr) => usr);
    const csvContent = `data:text/csv;charset=utf-8,name,email\n${users
      .map((properties) => properties.join(','))
      .join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'emails.csv');
    document.body.appendChild(link);

    link.click();
    handleSuccess(`CSV File with ${users.length} Emails Generated`);
    handleClose();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="btn-casama px-3 py-2 w-auto self-start"
      >
        Get Emails of Users with less than $1
      </button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleCopyEmails} disableRipple>
          <FaCopy className="mr-3 text-casama-blue" />
          Copy
        </MenuItem>
        <MenuItem onClick={handleEmailsCsv} disableRipple>
          <FaFileCsv className="mr-3 text-casama-blue" />
          CSV
        </MenuItem>
      </Menu>
    </>
  );
}
