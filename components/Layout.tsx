"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useBackup } from "../hooks/useDatabase";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { seedDemo } = useBackup();

  // Seed demo data on first load
  useEffect(() => {
    seedDemo();
  }, [seedDemo]);

  return (
    <div className="min-h-screen bg-linear-to-br from-forest-50 via-white to-bank-50/30">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-forest-200/50 bg-white/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <p className="text-forest-600 font-medium">
                  © 2026 Village Savings Bank
                  <span className="hidden sm:inline text-forest-400 ml-2">
                    • All data stored locally
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bank-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bank-500"></span>
                  </span>
                  <span className="text-forest-600 font-medium">
                    System Online
                  </span>
                  <span className="text-forest-400">•</span>
                  <span className="text-forest-500 font-mono text-xs">
                    v1.0.0
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
