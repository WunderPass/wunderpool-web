import { useState, useEffect } from 'react';
import { Menu, MenuItem, Typography, Divider, Badge } from '@mui/material';
import Link from 'next/link';

const axios = require('axios');

let timer;
export default function ClaimNotification(props) {
  const { user } = props;
  const [authorized, setAuthorized] = useState(false);

  const checkAuthForClaim = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      axios({
        method: 'get',
        url: '/api/claimable',
        params: { wunderId: user?.wunderId },
      }).then((res) => {
        setAuthorized(res?.data?.resp);
      });
    }, 800);
  };

  useEffect(() => {
    checkAuthForClaim();
  }, [user]);

  return (
    <>
      {authorized && (
        <>
          <Link
            href={`https://app.wunderpass.org/`}
            sx={{ textDecoration: 'none', color: 'inherit' }}
            passHref
          >
            <MenuItem>
              <Typography className="text-sm">Claim your 50$</Typography>
            </MenuItem>
          </Link>
        </>
      )}
    </>
  );
}
