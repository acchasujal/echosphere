import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { EmptyState } from './components/ui/Feedback';
import { Dashboard } from './pages/Dashboard';
import { CarbonTracking } from './pages/CarbonTracking';
import { CSR } from './pages/CSR';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ComingSoon: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="py-12">
    <EmptyState
      title={title}
      description={description}
    />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <AppShell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/carbon" element={<CarbonTracking />} />
                <Route path="/csr" element={<CSR />} />
                <Route 
                  path="/policies" 
                  element={
                    <ComingSoon 
                      title="Governance Coming Soon" 
                      description="Policy checklists, compliance issues, and governance dashboards will be implemented in the next phase." 
                    />
                  } 
                />
                <Route 
                  path="/rewards" 
                  element={
                    <ComingSoon 
                      title="Gamification Coming Soon" 
                      description="Employee badges, rewards catalog, and points redemption store will be implemented in the next phase." 
                    />
                  } 
                />
                <Route 
                  path="*" 
                  element={
                    <EmptyState 
                      title="Page Not Found" 
                      description="The page you are looking for does not exist." 
                    />
                  } 
                />
              </Routes>
            </AppShell>
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
