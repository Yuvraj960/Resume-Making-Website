import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

// Guards /dashboard — redirects to /auth if no token in localStorage
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" replace />;
}

// If already logged in, skip /auth and go straight to dashboard
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <Router>
      <div className="dark min-h-screen bg-background text-on-background">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
