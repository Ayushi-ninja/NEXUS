import { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useSidebar } from '../hooks/useRealtimeData';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isOpen, isMobile, toggle } = useSidebar();

  return (
    <div className="min-h-screen" style={{ background: '#030712' }}>
      <Sidebar isOpen={isOpen} isMobile={isMobile} onToggle={toggle} />
      <Navbar onMenuClick={toggle} isMobile={isMobile} />
      
      <main
        className="transition-all duration-300 pt-16"
        style={{ marginLeft: isMobile ? 0 : isOpen ? '256px' : '72px' }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
