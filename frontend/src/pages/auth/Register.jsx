import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const passwordRequirements = (pwd) => ({
  length: pwd.length >= 6,
  hasNumber: /\d/.test(pwd),
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reqs = passwordRequirements(contrasena);
  const passwordValid = reqs.length && reqs.hasNumber;
  const passwordsMatch = contrasena === confirmar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre || !correo || !contrasena || !confirmar) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!passwordValid) {
      setError('La contraseña no cumple los requisitos mínimos.');
      return;
    }
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register(nombre, correo, contrasena);
      navigate('/');
    } catch (err) {
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?');
      } else {
        setError(err.message || 'Error al crear la cuenta. Intenta de nuevo.');
      }
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
        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-subtitle">Únete y reserva tu cancha favorita</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {/* Nombre */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-name">
              <User size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Nombre completo <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="register-name"
              type="text"
              className="form-control"
              placeholder="Juan García"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(''); }}
              autoComplete="name"
            />
          </div>

          {/* Correo */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-email">
              <Mail size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Correo electrónico <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="register-email"
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
            <label className="input-label" htmlFor="register-password">
              <Lock size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Contraseña <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => { setContrasena(e.target.value); setError(''); }}
                style={{ paddingRight: '3rem' }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Indicadores de requisitos */}
            {contrasena.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <PasswordReq met={reqs.length} text="Mínimo 6 caracteres" />
                <PasswordReq met={reqs.hasNumber} text="Al menos 1 número" />
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="input-group">
            <label className="input-label" htmlFor="register-confirm">
              <Lock size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Confirmar contraseña <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="register-confirm"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmar}
              onChange={(e) => { setConfirmar(e.target.value); setError(''); }}
              style={{ borderColor: confirmar && !passwordsMatch ? 'var(--danger-color)' : '' }}
              autoComplete="new-password"
            />
            {confirmar && !passwordsMatch && (
              <span style={{ color: 'var(--danger-color)', fontSize: '0.8rem' }}>Las contraseñas no coinciden</span>
            )}
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
            id="register-submit-btn"
          >
            {loading ? (
              <><div className="spinner-sm"></div> Creando cuenta...</>
            ) : (
              <><UserPlus size={18} /> Crear cuenta</>
            )}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

const PasswordReq = ({ met, text }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: met ? '#4ade80' : 'var(--text-secondary)', transition: 'color 0.2s' }}>
    {met ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
    {text}
  </span>
);

export default Register;
