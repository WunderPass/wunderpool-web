import { useRouter } from 'next/router';
import TopBar from './topBar';
import BottomBar from './bottomBar';
import BottomBar2 from './bottomBar2';

export default function Navbar(props) {
  const { pathname } = useRouter();

  if (pathname === '/' || pathname === '/auth/create') return null;

  return (
    <div className="">
      <TopBar {...props} />
      <BottomBar2 {...props} />
    </div>
  );
}
