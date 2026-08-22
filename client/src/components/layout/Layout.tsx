import React from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar.js";
import { Footer } from "./Footer.js";

export interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
  onLodgeClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView = "home",
  onNavigate,
  onLodgeClick,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A2540] font-sans w-full max-w-full overflow-x-hidden">
      <Navbar
        currentView={currentView}
        onNavigate={onNavigate}
        onLodgeClick={onLodgeClick}
      />
      {/* pt-16 on mobile (h-16), pt-20 on sm+ (h-20), pb-20 on mobile for floating dock */}
      <main className="flex-1 pt-16 sm:pt-20 pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      {isHomePage && <Footer />}
    </div>
  );
};
