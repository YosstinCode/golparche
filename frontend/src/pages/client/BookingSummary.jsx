import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Timer,
  Wallet,
  Receipt,
  CheckCircle,
  Lock,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { court, date, hour } = location.state || {};

  // Guard: if someone navigates here directly without state, redirect home
  if (!court || !date || !hour) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={40} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Sin selección activa</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Parece que llegaste aquí sin haber seleccionado una cancha y horario.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Volver al inicio
        </button>
      </div>
    );
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Resumen de tu reserva</h2>
          <span className="badge badge-success">
            <CheckCircle size={12} /> Horario disponible
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Tu horario fue validado. Revisa los detalles antes de confirmar.
        </p>
      </div>

      {/* Summary Card */}
      <div className="summary-card" style={{ marginBottom: '2rem' }}>
        <div className="summary-card-header">
          <img
            src={court.image_url}
            alt={court.name}
            style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
          />
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{court.name}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {court.description}
            </p>
          </div>
        </div>

        <div className="summary-card-body">
          <div className="summary-row">
            <span className="summary-label">
              <Calendar size={15} /> Fecha
            </span>
            <span className="summary-value" style={{ textTransform: 'capitalize' }}>
              {formattedDate}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-label">
              <Clock size={15} /> Hora
            </span>
            <span className="summary-value">{hour}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">
              <Timer size={15} /> Duración
            </span>
            <span className="summary-value">1 hora</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">
              <Wallet size={15} /> Precio por hora
            </span>
            <span className="summary-value-accent">
              ${court.price_per_hour.toLocaleString('es-CO')} COP
            </span>
          </div>

          <div className="summary-row" style={{ paddingTop: '1.25rem', marginTop: '0.5rem', borderTop: '2px solid rgba(255,255,255,0.07)' }}>
            <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              <Receipt size={15} /> Total a pagar
            </span>
            <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
              ${court.price_per_hour.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      </div>

      {/* Notice: Next increment */}
      <div
        className="status-banner"
        style={{
          background: 'rgba(252,163,17,0.08)',
          border: '1px solid rgba(252,163,17,0.3)',
          color: 'var(--accent-color)',
          marginTop: 0,
          marginBottom: '2rem',
        }}
      >
        <Lock size={18} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600 }}>Incremento 3 – Confirmación y pago</div>
          <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.15rem' }}>
            El botón de confirmar reserva estará disponible en el siguiente incremento.
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
          style={{ padding: '0.9rem 1.75rem' }}
        >
          <ArrowLeft size={16} /> Cambiar selección
        </button>
        <button
          className="btn btn-primary"
          disabled
          style={{ padding: '0.9rem 2rem', fontSize: '1rem', opacity: 0.5, cursor: 'not-allowed' }}
          title="Disponible en el Incremento 3"
        >
          <Lock size={16} /> Confirmar reserva
        </button>
      </div>

      <style>{`
        @keyframes pageSlideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default BookingSummary;
