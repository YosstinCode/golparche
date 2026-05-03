import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Zap, CheckCheck, LogOut, User, BookOpen } from 'lucide-react';
import { AuthProvider, useAuth, ProtectedRoute } from './context/AuthContext';

import CourtSelection from './pages/client/CourtSelection';
import BookingSummary from './pages/client/BookingSummary';
import Payment from './pages/client/Payment';
import Confirmation from './pages/client/Confirmation';
import MyBookings from './pages/client/MyBookings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminAttendance from './pages/admin/AdminAttendance';

import './styles/design-system.css';

const CLIENT_STEPS = [
  { label: 'Selección',    path: '/' },
  { label: 'Validación',   path: '/checkout' },
  { label: 'Pago',         path: '/payment' },
  { label: 'Confirmación', path: '/confirmation' },
];

const AUTH_PATHS = ['/login', '/register'];

const StepIndicator = () => {
  const location = useLocation();
  const currentIndex = CLIENT_STEPS.findIndex(s => s.path === location.pathname);
  if (currentIndex === -1) return null;

  return (
    <div className="step-indicator">
      {CLIENT_STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <React.Fragment key={step.path}>
            {idx > 0 && (
              <div className={`step-separator ${isDone ? 'done' : ''}`}></div>
            )}
            <div className={`step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`} title={step.label}>
              {isDone ? <CheckCheck size={11} /> : idx + 1}
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--primary-color)' : isDone ? 'rgba(74, 222, 128, 0.8)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Header = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (AUTH_PATHS.includes(location.pathname)) return null;
  if (location.pathname.startsWith('/admin')) return null; // Admin has its own sidebar

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header-nav">
      <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Zap size={26} style={{ color: 'var(--primary-color)' }} />
        <span className="text-gradient">Golparche</span>
      </div>
      <StepIndicator />
      {user && (
        <div className="header-user-controls">
          {isAdmin() && (
            <button
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => navigate('/admin')}
            >
              Panel Admin
            </button>
          )}
          <button
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => navigate('/my-bookings')}
          >
            <BookOpen size={14} /> Mis Reservas
          </button>
          <div className="user-name-display">
            <User size={16} />
            <span>{profile?.nombre || user.email}</span>
          </div>
          <button
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
            onClick={handleLogout}
            id="logout-btn"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </header>
  );
};

function AppContent() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Client Routes */}
          <Route path="/" element={<ProtectedRoute><CourtSelection /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="admin"><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AdminAttendance /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
