"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  HandCoins,
  Calculator,
  Settings,
  ArrowLeftRight,
  CalendarDays,
  PiggyBank,
  Download,
  X,
  Heart,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/loans", label: "Loans", icon: HandCoins },
  {
    label: "Social Loans",
    href: "/social-loans",
    icon: Heart, // import { Heart } from 'lucide-react'
  },

  { href: "/calculator", label: "Interest Calculator", icon: Calculator },
  { href: "/pots", label: "The Three Pots", icon: PiggyBank },
  { href: "/cycles", label: "Cycles", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  console.log(pathname.slice(0, -1));
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-white/95 backdrop-blur-xl border-r border-forest-200/50
          shadow-xl lg:shadow-none
          transform transition-all duration-300 ease-out
          lg:transform-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-forest-100">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-forest-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-forest-600" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={onClose}
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-bank-600 via-bank-500 to-bank-600 flex items-center justify-center shadow-lg shadow-bank-500/30 group-hover:shadow-bank-500/50 transition-all duration-300 group-hover:scale-105">
              <Wallet className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 to-white/20" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-forest-900 group-hover:text-bank-700 transition-colors">
                Village Bank
              </h1>
              <p className="text-xs font-semibold text-bank-600 tracking-wider uppercase">
                Savings System
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-forest-200 scrollbar-track-transparent">
          {/* Main Menu */}
          <div className="space-y-1">
            <p className="px-4 py-2 text-xs font-bold text-forest-500 uppercase tracking-wider">
              Main Menu
            </p>
            {menuItems.slice(0, 5).map((item) => {
              const isActive =
                pathname.length > 1
                  ? pathname.slice(0, -1) === item.href
                  : pathname === item.href;

              // console.log("here -> ", pathname.slice(0, 1));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-bank-500 to-bank-600 text-white shadow-lg shadow-bank-500/25"
                        : "text-forest-700 hover:bg-forest-100 hover:text-forest-900"
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-forest-500 group-hover:text-bank-600 group-hover:scale-110"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Tools */}
          <div className="space-y-1">
            <p className="px-4 py-2 text-xs font-bold text-forest-500 uppercase tracking-wider">
              Tools
            </p>
            {menuItems.slice(5, 7).map((item) => {
              const isActive = pathname.slice(0, -1) === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-bank-500 to-bank-600 text-white shadow-lg shadow-bank-500/25"
                        : "text-forest-700 hover:bg-forest-100 hover:text-forest-900"
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-forest-500 group-hover:text-bank-600 group-hover:scale-110"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* System */}
          <div className="space-y-1">
            <p className="px-4 py-2 text-xs font-bold text-forest-500 uppercase tracking-wider">
              System
            </p>
            {menuItems.slice(7).map((item) => {
              const isActive = pathname.slice(0, -1) === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-bank-500 to-bank-600 text-white shadow-lg shadow-bank-500/25"
                        : "text-forest-700 hover:bg-forest-100 hover:text-forest-900"
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-forest-500 group-hover:text-bank-600 group-hover:scale-110"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-forest-100 bg-forest-50/50">
          <Link
            href="/backup"
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-forest-700 hover:bg-white hover:text-bank-600 font-medium transition-all duration-200 hover:shadow-md"
            onClick={onClose}
          >
            <Download className="w-5 h-5 text-forest-500 group-hover:text-bank-600 transition-colors" />
            <span>Backup Data</span>
          </Link>
          <div className="mt-4 px-4 space-y-1">
            <p className="text-xs font-medium text-forest-600">
              © 2026 Village Banking
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-bank-500" />
                <p className="text-xs text-forest-500 font-medium">
                  Offline First
                </p>
              </div>
              <span className="text-forest-300">•</span>
              <p className="text-xs text-forest-500 font-medium">Secure</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
