import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Zap, CheckCheck, LogOut, User, BookOpen, ShieldCheck } from 'lucide-react';
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
import AdminReports from './pages/admin/AdminReports';

import './styles/design-system.css';

const CLIENT_STEPS = [
  { label: 'Canchas',      path: '/' },
  { label: 'Detalles',     path: '/checkout' },
  { label: 'Pago',         path: '/payment' },
  { label: 'Confirmación', path: '/confirmation' },
];

const AUTH_PATHS = ['/login', '/register'];

const StepIndicator = () => {
  const location = useLocation();
  const currentIndex = CLIENT_STEPS.findIndex(s => s.path === location.pathname);
  if (currentIndex === -1) return null;

  return (
    <div className="step-indicator-wrapper animate-fade">
      {CLIENT_STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <React.Fragment key={step.path}>
            {idx > 0 && (
              <div className={`step-line ${isDone ? 'done' : ''}`}></div>
            )}
            <div className={`step-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <div className="node-circle">
                {isDone ? <CheckCheck size={12} /> : idx + 1}
              </div>
              <span className="node-label">{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}

      <style>{`
        .step-indicator-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.03);
          padding: 0.75rem 1.5rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .step-node {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          opacity: 0.4;
          transition: all 0.4s ease;
        }
        .step-node.active { opacity: 1; }
        .step-node.done { opacity: 0.8; }
        .node-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .active .node-circle {
          background: var(--primary);
          color: #000;
          box-shadow: 0 0 15px var(--primary-glow);
          border-color: transparent;
        }
        .done .node-circle {
          background: rgba(34, 197, 94, 0.2);
          color: var(--success);
          border-color: var(--success);
        }
        .node-label {
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
        }
        .step-line {
          width: 30px;
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
        }
        .step-line.done {
          background: var(--primary);
          opacity: 0.3;
        }
        @media (max-width: 1024px) {
          .node-label { display: none; }
          .step-indicator-wrapper { padding: 0.5rem 1rem; }
        }
      `}</style>
    </div>
  );
};

const Header = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (AUTH_PATHS.includes(location.pathname)) return null;
  if (location.pathname.startsWith('/admin')) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-glow">
          <Zap size={24} fill="var(--primary)" color="var(--primary)" />
        </div>
        <span className="logo-text">GOL<span className="text-gradient">PARCHE</span></span>
      </div>

      <StepIndicator />

      <div className="header-right">
        {user ? (
          <div className="user-nav">
            <button className="btn-icon" onClick={() => navigate('/my-bookings')} title="Mis Reservas">
              <BookOpen size={20} />
            </button>
            
            {isAdmin() && (
              <button className="btn-admin" onClick={() => navigate('/admin')}>
                <ShieldCheck size={18} /> <span>Admin</span>
              </button>
            )}

            <div className="user-profile">
              <div className="user-avatar">
                {profile?.nombre?.[0] || user.email[0]}
              </div>
              <div className="user-info">
                <span className="user-name">{profile?.nombre?.split(' ')[0] || 'Jugador'}</span>
                <span className="user-role">{isAdmin() ? 'Administrador' : 'Cliente'}</span>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout} title="Cerrar Sesión">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
        )}
      </div>

      <style>{`
        .main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-glow {
          filter: drop-shadow(0 0 8px var(--primary-glow));
        }
        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .user-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-icon {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-icon:hover {
          color: var(--primary);
          background: rgba(0, 210, 255, 0.05);
          border-color: var(--primary);
        }
        .btn-admin {
          background: var(--primary-glow);
          border: 1px solid var(--primary);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 1rem 0.4rem 0.5rem;
          background: rgba(255,255,255,0.03);
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #000;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
        }
        .user-role {
          font-size: 0.65rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .logout-button {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 0.5rem;
          transition: var(--transition);
        }
        .logout-button:hover {
          color: var(--danger);
        }
        @media (max-width: 768px) {
          .user-info, .btn-admin span { display: none; }
          .header-right { gap: 0.5rem; }
        }
      `}</style>
    </header>
  );
};

function AppContent() {
  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><CourtSelection /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="admin"><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
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
