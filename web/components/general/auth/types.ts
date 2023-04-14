import { LoginMethod } from '../../../hooks/useUser';

export type AuthCallback = (data: {
  wunderId: string;
  address: string;
  loginMethod: LoginMethod;
  newUser?: boolean;
}) => void;
