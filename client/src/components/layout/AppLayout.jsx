import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Outlet />
      </div>
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </div>
  );
}
