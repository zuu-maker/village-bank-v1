"use client";
import React, { useState } from "react";
import { Menu, Bell, Search, User, ChevronDown, X } from "lucide-react";
import { useSettings } from "@/hooks/useDatabase";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { settings } = useSettings();

  const notifications = [
    {
      id: 1,
      message: "Mary Mwanza loan due in 3 days",
      type: "warning",
      time: "2 hours ago",
    },
    {
      id: 2,
      message: "New member registered: Peter Tembo",
      type: "info",
      time: "5 hours ago",
    },
    {
      id: 3,
      message: "Monthly meeting reminder for tomorrow",
      type: "info",
      time: "1 day ago",
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-forest-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-18">
        {/* Left side */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-forest-100 active:bg-forest-200 transition-all duration-200 hover:scale-105"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-forest-700" />
          </button>

          {title && (
            <div className="hidden sm:block">
              <h2 className="text-xl lg:text-2xl font-display font-bold bg-gradient-to-r from-forest-900 to-forest-700 bg-clip-text text-transparent">
                {title}
              </h2>
            </div>
          )}
        </div>

        {/* Center - Search (Desktop) */}
        {/* <div className="hidden lg:block flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
            <input
              type="text"
              placeholder="Search members, transactions..."
              className="w-full pl-12 pr-4 py-3 bg-forest-50/80 border border-forest-200 rounded-xl
                text-forest-900 placeholder:text-forest-400
                focus:bg-white focus:border-bank-400 focus:ring-4 focus:ring-bank-500/10
                transition-all duration-200"
            />
          </div>
        </div> */}

        {/* Mobile Search Overlay */}
        {/* {showSearch && (
          <div className="fixed inset-0 bg-white z-50 lg:hidden animate-fade-in">
            <div className="flex items-center gap-3 px-4 h-16 border-b border-forest-200">
              <Search className="w-5 h-5 text-forest-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search members, transactions..."
                autoFocus
                className="flex-1 py-2 bg-transparent text-forest-900 placeholder:text-forest-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-lg hover:bg-forest-100 transition-colors"
              >
                <X className="w-5 h-5 text-forest-600" />
              </button>
            </div>
          </div>
        )} */}

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Button */}
          {/* <button
            onClick={() => setShowSearch(true)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-forest-100 transition-all duration-200 hover:scale-105"
          >
            <Search className="w-5 h-5 text-forest-700" />
          </button> */}

          {/* Notifications */}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 pr-3 sm:pr-4 rounded-xl hover:bg-forest-100 transition-all duration-200 hover:scale-105"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 flex items-center justify-center shadow-md shadow-bank-500/30">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-sm font-semibold text-forest-800">
                  Treasurer
                </span>
                <span className="block text-xs text-forest-500">Admin</span>
              </div>
              <ChevronDown className="w-4 h-4 text-forest-400 hidden sm:block" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-forest-200/50 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-forest-100 bg-forest-50/50">
                    <p className="text-sm font-semibold text-forest-900">
                      Treasurer
                    </p>
                    <p className="text-xs text-forest-500 mt-0.5">
                      System Administrator
                    </p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-forest-700 hover:bg-forest-50 transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-forest-700 hover:bg-forest-50 transition-colors">
                      Change Password
                    </button>
                    <div className="my-1 border-t border-forest-100" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bank name banner */}
      <div className="bg-gradient-to-r from-bank-700 via-bank-600 to-bank-700 text-white">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2">
          <p className="text-sm font-semibold tracking-wide">
            {settings.bankName}
          </p>
          <span className="text-bank-200">•</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bank-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <p className="text-sm font-medium">Offline Mode Active</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
