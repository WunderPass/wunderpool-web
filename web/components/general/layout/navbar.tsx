import { useRouter } from 'next/router';
import TopBar from './topBar';
import BottomBar from './bottomBar';
import { UseUserType } from '../../../hooks/useUser';

type NavbarProps = {
  user: UseUserType;
};

export default function Navbar(props: NavbarProps) {
  const { pathname } = useRouter();

  if (pathname === '/' || pathname === '/auth/create') return null;

  return (
    <div className="">
      <TopBar {...props} />
      <BottomBar />
    </div>
  );
}
