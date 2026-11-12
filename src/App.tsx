/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { BudgetAdvisorPage } from './pages/BudgetAdvisorPage';
import { SettingsPage } from './pages/SettingsPage';

const WorkspaceShell: React.FC = () => {
  const { activePage, sidebarCollapsed } = useFinance();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'chatbot':
        return <ChatbotPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'predictions':
        return <PredictionsPage />;
      case 'budget':
        return <BudgetAdvisorPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <TopBar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <WorkspaceShell />
    </FinanceProvider>
  );
}
