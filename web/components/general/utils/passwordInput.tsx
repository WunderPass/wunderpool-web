import { Dispatch, SetStateAction, useState } from 'react';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

type PasswordInputProps = {
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  label?: string;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

export default function PasswordInput(props: PasswordInputProps) {
  const { password, setPassword, label, error, autoComplete, autoFocus } =
    props;
  const [showPassword, setShowPassword] = useState(false);
  const elemId = `${label ? label.split(' ').join('-') : 'Password'}-Input`;

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel htmlFor="password-input">{label || 'Password'}</InputLabel>
      <OutlinedInput
        id={elemId}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={handlePassword}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
              tabIndex={-1}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label || 'Password'}
        autoFocus={autoFocus}
        autoComplete={autoComplete || 'current-password'}
      />
      {error && <Typography className="text-red-500 mt-1">{error}</Typography>}
    </FormControl>
  );
}
