import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      setLoading(false);
    } else {
      // Todos los roles van a la home page
      navigate('/');
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card glass-card">
        {/* Logo Section */}
        <div className="auth-header">
          <div className="auth-logo-bg">
            <Zap size={32} className="logo-icon" />
          </div>
          <h1 className="auth-title">Bienvenido de <span className="text-gradient">Nuevo</span></h1>
          <p className="auth-subtitle">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <Loader2 className="spinner-sm" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>Acceder al sistema <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes una cuenta? <Link to="/register" className="auth-link">Regístrate gratis</Link></p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 3.5rem;
          position: relative;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-logo-bg {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(58, 123, 213, 0.1));
          border: 1px solid rgba(0, 210, 255, 0.2);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--primary);
        }

        .auth-title {
          font-size: 2.25rem;
          margin-bottom: 0.75rem;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .auth-error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          padding: 0.85rem 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          animation: shake 0.4s ease-in-out;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
          pointer-events: none;
        }

        .auth-form .form-input {
          padding-left: 3.25rem;
        }

        .auth-submit {
          width: 100%;
          padding: 1rem;
          margin-top: 1rem;
        }

        .auth-footer {
          margin-top: 2.5rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .auth-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          margin-left: 0.25rem;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
