import React from 'react';
import DashboardClient from './components/DashboardClient';
import WorkRequestCreator from './components/WorkRequestCreator';

export default function DashboardPage() {
  return (
    <main>
      <DashboardClient />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <WorkRequestCreator />
      </div>
    </main>
  );
}