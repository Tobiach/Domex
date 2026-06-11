import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { initAnalytics } from './lib/analytics';

const Dashboard   = lazy(() => import('./views/Dashboard'));
const DomexAI     = lazy(() => import('./views/DomexAI'));
const Ideas       = lazy(() => import('./views/Ideas'));
const Tasks       = lazy(() => import('./views/Tasks'));
const Capital     = lazy(() => import('./views/Capital'));
const CRM         = lazy(() => import('./views/CRM'));
const Mercado     = lazy(() => import('./views/Mercado'));
const IntelFeed   = lazy(() => import('./views/IntelFeed'));
const More        = lazy(() => import('./views/More'));
const Habilidades = lazy(() => import('./views/Habilidades'));
const Onboarding  = lazy(() => import('./views/Onboarding'));
const Settings    = lazy(() => import('./views/Settings'));
const Habitos     = lazy(() => import('./views/Habitos'));
const Conciencia    = lazy(() => import('./views/Conciencia'));
const Aprendizaje   = lazy(() => import('./views/Aprendizaje'));
const Nutricion     = lazy(() => import('./views/Nutricion'));
const Memoria       = lazy(() => import('./views/Memoria'));
const EnergyTracker    = lazy(() => import('./views/EnergyTracker'));
const HormoneBalance   = lazy(() => import('./views/HormoneBalance'));
const EnergyBalance    = lazy(() => import('./views/EnergyBalance'));
const LearningPaths    = lazy(() => import('./views/LearningPaths'));
const Biblioteca       = lazy(() => import('./views/Biblioteca'));
const Debate           = lazy(() => import('./views/Debate'));
const OptimizacionHub  = lazy(() => import('./views/OptimizacionHub'));
const DecisionLog      = lazy(() => import('./views/DecisionLog'));
const Accountability   = lazy(() => import('./views/Accountability'));
const LegacyBuilder    = lazy(() => import('./views/LegacyBuilder'));
const Landing          = lazy(() => import('./views/Landing'));
const Login            = lazy(() => import('./views/Login'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-40">
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  useEffect(() => { initAnalytics(); }, []);

  return (
    <AuthProvider>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <Suspense fallback={<div className="min-h-screen bg-[#06060E]" />}>
              <Login />
            </Suspense>
          } />
          <Route path="/landing" element={
            <Suspense fallback={<div className="min-h-screen bg-[#06060E]" />}>
              <Landing />
            </Suspense>
          } />
          <Route path="/onboarding" element={
            <Suspense fallback={<div className="min-h-screen bg-[#06060E]" />}>
              <Onboarding />
            </Suspense>
          } />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="chat"       element={<Suspense fallback={<PageLoader />}><DomexAI /></Suspense>} />
            <Route path="ideas"      element={<Suspense fallback={<PageLoader />}><Ideas /></Suspense>} />
            <Route path="tasks"      element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
            <Route path="crm"        element={<Suspense fallback={<PageLoader />}><CRM /></Suspense>} />
            <Route path="capital"    element={<Suspense fallback={<PageLoader />}><Capital /></Suspense>} />
            <Route path="mercado"    element={<Suspense fallback={<PageLoader />}><Mercado /></Suspense>} />
            <Route path="intel"      element={<Suspense fallback={<PageLoader />}><IntelFeed /></Suspense>} />
            <Route path="more"       element={<Suspense fallback={<PageLoader />}><More /></Suspense>} />
            <Route path="habilidades" element={<Suspense fallback={<PageLoader />}><Habilidades /></Suspense>} />
            <Route path="habitos"    element={<Suspense fallback={<PageLoader />}><Habitos /></Suspense>} />
            <Route path="settings"     element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            <Route path="conciencia"   element={<Suspense fallback={<PageLoader />}><Conciencia /></Suspense>} />
            <Route path="conciencia/aprender" element={<Suspense fallback={<PageLoader />}><Aprendizaje /></Suspense>} />
            <Route path="conciencia/nutricion" element={<Suspense fallback={<PageLoader />}><Nutricion /></Suspense>} />
            <Route path="conciencia/memoria" element={<Suspense fallback={<PageLoader />}><Memoria /></Suspense>} />
            <Route path="conciencia/energia"   element={<Suspense fallback={<PageLoader />}><EnergyTracker /></Suspense>} />
            <Route path="conciencia/hormonas"  element={<Suspense fallback={<PageLoader />}><HormoneBalance /></Suspense>} />
            <Route path="conciencia/balance"    element={<Suspense fallback={<PageLoader />}><EnergyBalance /></Suspense>} />
            <Route path="conciencia/paths"      element={<Suspense fallback={<PageLoader />}><LearningPaths /></Suspense>} />
            <Route path="conciencia/biblioteca" element={<Suspense fallback={<PageLoader />}><Biblioteca /></Suspense>} />
            <Route path="conciencia/debate"          element={<Suspense fallback={<PageLoader />}><Debate /></Suspense>} />
            <Route path="optimizacion"               element={<Suspense fallback={<PageLoader />}><OptimizacionHub /></Suspense>} />
            <Route path="optimizacion/decisiones"    element={<Suspense fallback={<PageLoader />}><DecisionLog /></Suspense>} />
            <Route path="optimizacion/accountability" element={<Suspense fallback={<PageLoader />}><Accountability /></Suspense>} />
            <Route path="optimizacion/legado"        element={<Suspense fallback={<PageLoader />}><LegacyBuilder /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
    </AuthProvider>
  );
}
