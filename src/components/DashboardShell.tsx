import { useState } from 'react';
import {
  Mountain, LogOut, Menu, X,
  LayoutDashboard, Building2, GraduationCap, FileText, DollarSign,
  Users, BarChart3, UserPlus, UserCheck, CalendarDays, RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { MockUser, NavItem } from '../types';
import { ROLE_LABELS } from '../mockData';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, GraduationCap, FileText, DollarSign,
  Users, BarChart3, UserPlus, UserCheck, CalendarDays, RefreshCw,
};

interface DashboardShellProps {
  user: MockUser;
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardShell({
  user,
  navItems,
  activeKey,
  onNavigate,
  onLogout,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeItem = navItems.find((item) => item.key === activeKey);

  return (
    <div className="min-h-screen bg-grey-bg flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-navy flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-white/10">
          <div className="w-48 h-12 flex align items-left justify-center">
            <img src="https://cscglobalcanada.ca/images/Logo2.png" alt="Logo" />
          </div>
          
          <button
            className="ml-auto lg:hidden text-white/60"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setSidebarOpen(false);
                }}
                className={`nav-item w-full ${
                  activeKey === item.key ? 'nav-item-active' : 'nav-item-inactive'
                }`}
              >
                {Icon && <Icon size={18} className="flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.viewOnly && (
                  <span className="ml-auto text-[10px] text-white/40 font-normal italic">view</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="nav-item w-full nav-item-inactive"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-grey-border px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            className="lg:hidden text-navy"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <h1 className="text-lg font-semibold text-navy flex-1 min-w-0 truncate">
            {activeItem?.label || 'Overview'}
          </h1>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-navy leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{user.branch}</p>
            </div>
            <span className="role-badge">{ROLE_LABELS[user.role]}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
