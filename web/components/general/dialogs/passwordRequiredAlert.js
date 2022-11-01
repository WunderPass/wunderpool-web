import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { forwardRef } from 'react';
import PasswordInput from '/components/general/utils/passwordInput';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PasswordRequiredAlert({ user }) {
  const { passwordRequired } = user;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      user.decryptKeyWithPassword(password);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      className="rounded-xl"
      open={passwordRequired}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Password Required</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <form onSubmit={handleSubmit} className="pt-2">
            <PasswordInput
              password={password}
              setPassword={setPassword}
              error={error}
            />
            <button type="submit" className="btn-casama py-3 w-full my-2">
              Login
            </button>
          </form>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
