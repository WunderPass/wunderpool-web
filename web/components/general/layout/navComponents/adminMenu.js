import { Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function AdminMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <li
        className={`px-4 p-2 rounded-lg cursor-pointer hover:bg-casama-light-blue ${
          /\/admin\//.test(router.pathname) ? 'bg-casama-light-blue' : ''
        }`}
        onClick={handleClick}
      >
        <span className="hidden md:block">Admin</span>
        <span className="md:hidden">🪄</span>
      </li>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          className="text-xl"
          selected={/\/admin\/stats/.test(router.pathname)}
          onClick={() => {
            router.push('/admin/stats');
            handleClose();
          }}
        >
          📊 Stats
        </MenuItem>
        <MenuItem
          className="text-xl"
          selected={/\/admin\/betting/.test(router.pathname)}
          onClick={() => {
            router.push('/admin/betting');
            handleClose();
          }}
        >
          🎰 Betting
        </MenuItem>
        <MenuItem
          className="text-xl"
          selected={/\/admin\/onChainData/.test(router.pathname)}
          onClick={() => {
            router.push('/admin/onChainData');
            handleClose();
          }}
        >
          ⛓ On Chain Data
        </MenuItem>
        <MenuItem
          className="text-xl"
          selected={/\/admin\/govTokens/.test(router.pathname)}
          onClick={() => {
            router.push('/admin/govTokens');
            handleClose();
          }}
        >
          🪙 Sync Gov Tokens
        </MenuItem>
      </Menu>
    </>
  );
}
