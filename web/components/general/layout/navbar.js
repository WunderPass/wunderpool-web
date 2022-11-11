import { useRouter } from 'next/router';
import TopBar from './topBar';
import BottomBar from './bottomBar';

export default function Navbar(props) {
  const { pathname } = useRouter();

  if (pathname === '/' || pathname === '/auth/create') return null;

  return (
    <div className="">
      <TopBar {...props} />
      <BottomBar {...props} />
    </div>
  );
}
