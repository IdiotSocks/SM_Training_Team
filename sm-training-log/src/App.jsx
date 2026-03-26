import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AthleteLog from './pages/AthleteLog';
import './App.css';

function ProtectedRoute({ children, userRole }) {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/log"
          element={
            <ProtectedRoute userRole={userRole}>
              <AthleteLog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute userRole={userRole}>
              <AthleteLog showHistory />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to={user ? '/log' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
