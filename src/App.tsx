import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/Layout/MainLayout';
import Dashboard from './views/Dashboard';
import DomexAI from './views/DomexAI';
import Ideas from './views/Ideas';
import Tasks from './views/Tasks';
import Capital from './views/Capital';
import CRM from './views/CRM';
import Mercado from './views/Mercado';
import IntelFeed from './views/IntelFeed';
import More from './views/More';
import Habilidades from './views/Habilidades';
import Onboarding from './views/Onboarding';
import Settings from './views/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<DomexAI />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="crm" element={<CRM />} />
            <Route path="capital" element={<Capital />} />
            <Route path="mercado" element={<Mercado />} />
            <Route path="intel" element={<IntelFeed />} />
            <Route path="more" element={<More />} />
            <Route path="habilidades" element={<Habilidades />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
