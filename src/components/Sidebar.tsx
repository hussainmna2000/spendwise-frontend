import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  ReceiptText,
  BarChart3,
  TrendingUp,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  WalletCards,
  X,
} from 'lucide-react';
import { PageId } from '../types/finance';
import { useFinance } from '../context/FinanceContext';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquareText },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'analytics', label: 'Spending Analytics', icon: BarChart3 },
  { id: 'predictions', label: 'Predictions', icon: TrendingUp },
  { id: 'budget', label: 'Budget Advisor', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useFinance();

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Fixed / Collapsible Sidebar */}
      <aside
        aria-label="Primary Sidebar Navigation"
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#0F172A] text-slate-300 border-r border-slate-800 transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:bg-blue-500 transition-colors">
              <WalletCards size={20} />
            </div>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
                SpendWise AI
              </span>
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${sidebarCollapsed && !mobileMenuOpen ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                {(!sidebarCollapsed || mobileMenuOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle Footer */}
        <div className="p-3 border-t border-slate-800/80 hidden lg:block shrink-0">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
