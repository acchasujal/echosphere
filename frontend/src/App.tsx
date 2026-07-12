import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { EmptyState } from './components/ui/Feedback';
import { Dashboard } from './pages/Dashboard';
import { CarbonTracking } from './pages/CarbonTracking';
import { CSR } from './pages/CSR';
import { Governance } from './pages/Governance';
import { Rewards } from './pages/Rewards';
import { Challenges } from './pages/Challenges';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


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
                <Route path="/policies" element={<Governance />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/settings" element={<Settings />} />
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
