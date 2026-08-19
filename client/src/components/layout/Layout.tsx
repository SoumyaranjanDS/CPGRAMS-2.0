import React from 'react';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';

export interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
  user?: any;
  onLoginClick?: () => void;
  onLodgeClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView = 'home',
  onNavigate,
  user,
  onLoginClick,
  onLodgeClick,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0B] selection:bg-[#2563EB] selection:text-white font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        user={user}
        onLoginClick={onLoginClick}
        onLodgeClick={onLodgeClick}
      />
      <main className="flex-1 pt-28 pb-16">{children}</main>
      <Footer />
    </div>
  );
};
