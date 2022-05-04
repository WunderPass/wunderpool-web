import { Alert, Button, Snackbar } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Notification(props) {
  const [open, setOpen] = useState(false);
  const { notification } = props;

  const color = notification.type || 'success';

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(notification.active);
  }, [notification]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={9000}
      onClose={handleClose}
      sx={{ bottom: { xs: 90, sm: 90, md: 30 } }}
    >
      <Alert
        onClose={handleClose}
        severity={color}
        sx={{ width: '100%' }}
        action={
          notification.url && (
            <Link href={notification.url} passHref>
              <button
                className="btn-default"
                color={color}
                variant="outlined"
                size="small"
              >
                {notification.label}
              </button>
            </Link>
          )
        }
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
