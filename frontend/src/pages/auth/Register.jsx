import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, UserPlus, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    const { error: regError } = await register(formData.email, formData.password, formData.nombre);

    if (regError) {
      setError('Error al crear la cuenta. Es posible que el correo ya esté en uso.');
      setLoading(false);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card glass-card">
        {/* Logo Section */}
        <div className="auth-header">
          <div className="auth-logo-bg">
            <UserPlus size={32} className="logo-icon" />
          </div>
          <h1 className="auth-title">Únete a la <span className="text-gradient">Cancha</span></h1>
          <p className="auth-subtitle">Crea tu cuenta en segundos y empieza a jugar</p>
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
            <label className="form-label">Nombre Completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                name="nombre"
                type="text"
                className="form-input"
                placeholder="Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="tu@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <Loader2 className="spinner-sm" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>Crear mi cuenta <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link></p>
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
          max-width: 520px;
          padding: 3rem;
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
      `}</style>
    </div>
  );
};

export default Register;
