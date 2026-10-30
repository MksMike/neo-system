import './styles/globals.css';
import './styles/tailwind-theme.css';
import './styles/futurista.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { NAV, itemPath } from './app/nav';
import { AppShell } from './components/shell/app-shell';
import { DashboardPage } from './pages/dashboard';
import { PlaceholderPage } from './pages/placeholder';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/resumo" replace />} />
          <Route path="/dashboard/resumo" element={<DashboardPage />} />
          {NAV.map((item) => (
            <Route
              key={item.slug}
              path={`/${item.slug}`}
              element={
                item.subs.length > 0 ? (
                  <Navigate to={itemPath(item)} replace />
                ) : (
                  <PlaceholderPage />
                )
              }
            />
          ))}
          <Route path="/:item/:sub" element={<PlaceholderPage />} />
          <Route path="*" element={<Navigate to="/dashboard/resumo" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </StrictMode>,
);
