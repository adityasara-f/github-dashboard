import React from 'react';
import { OrgOverviewPanel, RepoListPanel, SearchPanel } from '../components';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">GitHub Organization Dashboard</h1>
            <p className="text-sm text-slate-400">
              Inspect repositories, activity, and language distribution for any public GitHub organization.
            </p>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            <SearchPanel />
            <RepoListPanel />
          </div>

          <aside className="space-y-4">
            <OrgOverviewPanel />
          </aside>
        </section>
      </main>
    </div>
  );
};
