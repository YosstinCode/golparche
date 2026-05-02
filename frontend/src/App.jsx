import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Zap, CheckCheck } from 'lucide-react';
import CourtSelection from './pages/client/CourtSelection';
import BookingSummary from './pages/client/BookingSummary';
import Payment from './pages/client/Payment';
import Confirmation from './pages/client/Confirmation';
import './styles/design-system.css';

/**
 * Step indicator component.
 * Tracks the current step based on the route.
 */
const StepIndicator = () => {
  const location = useLocation();

  const steps = [
    { label: 'Selección',    path: '/' },
    { label: 'Validación',   path: '/checkout' },
    { label: 'Pago',         path: '/payment' },
    { label: 'Confirmación', path: '/confirmation' },
  ];

  const currentIndex = steps.findIndex(s => s.path === location.pathname);

  return (
    <div className="step-indicator">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <React.Fragment key={step.path}>
            {idx > 0 && (
              <div className={`step-separator ${isDone ? 'done' : ''}`}></div>
            )}
            <div
              className={`step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              title={step.label}
            >
              {isDone ? <CheckCheck size={11} /> : idx + 1}
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive
                  ? 'var(--primary-color)'
                  : isDone
                    ? 'rgba(74, 222, 128, 0.8)'
                    : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {step.label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header-nav">
          <div className="logo-container">
            <Zap size={26} style={{ color: 'var(--primary-color)' }} />
            <span className="text-gradient">Golparche</span>
          </div>
          <StepIndicator />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<CourtSelection />} />
            <Route path="/checkout" element={<BookingSummary />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/confirmation" element={<Confirmation />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
