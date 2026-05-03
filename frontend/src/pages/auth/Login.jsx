import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(correo, contrasena);
      // Fetch profile to know the role and redirect accordingly
      const userId = data.user.id;
      const { supabase: sb } = await import('../../config/supabase');
      const { data: profileData } = await sb.from('profiles').select('rol').eq('id', userId).single();
      navigate('/');
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        {/* Logo */}
        <div className="auth-logo">
          <Zap size={32} style={{ color: 'var(--primary-color)' }} />
          <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Golparche</span>
        </div>
        <h1 className="auth-title">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Inicia sesión para gestionar tus reservas</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {/* Correo */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              <Mail size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => { setCorreo(e.target.value); setError(''); }}
              autoComplete="email"
            />
          </div>

          {/* Contraseña */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              <Lock size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => { setContrasena(e.target.value); setError(''); }}
                style={{ paddingRight: '3rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Olvidaste contraseña */}
          <div style={{ textAlign: 'right', marginTop: '-0.75rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', fontSize: '0.85rem' }}
              onClick={() => alert('Te enviaríamos un enlace de recuperación a tu correo. (Simulación)')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="status-banner status-banner-error" style={{ marginBottom: '1.5rem', marginTop: 0 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <><div className="spinner-sm"></div> Iniciando sesión...</>
            ) : (
              <><LogIn size={18} /> Iniciar sesión</>
            )}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
