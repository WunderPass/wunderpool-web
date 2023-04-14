import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useState } from 'react';
import { forwardRef } from 'react';
import { UseUserType } from '../../../hooks/useUser';
import PasswordInput from '../utils/passwordInput';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type PasswordRequiredAlertProps = {
  passwordRequired: boolean;
} & (
  | {
      user?: undefined;
      onSuccess: (password: string) => void;
    }
  | {
      user: UseUserType;
      onSuccess?: undefined;
    }
);

export default function PasswordRequiredAlert({
  user,
  passwordRequired,
  onSuccess,
}: PasswordRequiredAlertProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSuccess ? onSuccess(password) : user.decryptKeyWithPassword(password);
      setPassword('');
      setError('');
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
