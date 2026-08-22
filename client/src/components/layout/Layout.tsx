import React from 'react';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';

export interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
  onLodgeClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView = 'home',
  onNavigate,
  onLodgeClick,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A2540] font-sans w-full max-w-full overflow-x-hidden">
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        onLodgeClick={onLodgeClick}
      />
      {/* pt-16 on mobile (h-16), pt-20 on sm+ (h-20) */}
      <main className="flex-1 pt-16 sm:pt-20 pb-16 w-full max-w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
};
