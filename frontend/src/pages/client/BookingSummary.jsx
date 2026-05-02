import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Timer,
  Wallet,
  Receipt,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingStatus, setBookingStatus] = useState('idle'); // idle | loading | success | error
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { court, date, hour } = location.state || {};

  // Guard: redirect if arrived without data
  useEffect(() => {
    if (!court || !date || !hour) {
      navigate('/');
    }
  }, [court, date, hour, navigate]);

  if (!court || !date || !hour) return null;

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Incremento 3: Create the booking via POST /bookings ─────────
  const handleConfirmBooking = async () => {
    setBookingStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancha_id: court.id,
          fecha: date,
          hora: hour,
          user_id: user?.id,
          precio_total: court.precio_hora,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la reserva');
      }

      setBookingStatus('success');
      setConfirmedBooking(data.reserva);

    } catch (error) {
      setBookingStatus('error');
      setErrorMessage(error.message);
    }
  };

  // ── Confirmed state ─────────────────────────────────────────────
  if (bookingStatus === 'success' && confirmedBooking) {
    return (
      <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          {/* Success hero */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid rgba(34, 197, 94, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
            }}>
              <CheckCircle size={38} style={{ color: 'var(--success-color)' }} />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--success-color)' }}>¡Reserva creada!</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Tu reserva está <strong style={{ color: 'var(--accent-color)' }}>PENDIENTE</strong> de pago. Tienes 15 minutos para completarla.
            </p>
          </div>

          {/* Booking receipt */}
          <div className="summary-card" style={{ marginBottom: '1.5rem' }}>
            <div className="summary-card-header">
              <ShieldCheck size={22} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Comprobante de reserva</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontFamily: 'monospace' }}>
                  ID: {confirmedBooking.id.split('-')[0].toUpperCase()}
                </div>
              </div>
            </div>

            <div className="summary-card-body">
              <div className="summary-row">
                <span className="summary-label"><Calendar size={14} /> Cancha</span>
                <span className="summary-value">{confirmedBooking.cancha_nombre}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label"><Calendar size={14} /> Fecha</span>
                <span className="summary-value" style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label"><Clock size={14} /> Hora</span>
                <span className="summary-value">{confirmedBooking.hora}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label"><Timer size={14} /> Duración</span>
                <span className="summary-value">1 hora</span>
              </div>
              <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  <Receipt size={15} /> Total a pagar
                </span>
                <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
                  ${confirmedBooking.precio_total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          </div>

          {/* Next increment notice */}
          <div className="status-banner" style={{
            background: 'rgba(252,163,17,0.08)',
            border: '1px solid rgba(252,163,17,0.3)',
            color: 'var(--accent-color)', marginTop: 0, marginBottom: '2rem',
          }}>
            <CreditCard size={18} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600 }}>Incremento 4 – Pago</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '0.15rem' }}>
                El módulo de pago estará disponible en el siguiente incremento.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/')} style={{ flex: 1 }}>
              <ArrowLeft size={16} /> Nueva reserva
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => navigate('/payment', { state: { booking: confirmedBooking } })}
            >
              <CreditCard size={16} /> Ir a pagar
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pageSlideIn {
            from { opacity: 0; transform: translateX(30px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── Default: summary + confirm button ───────────────────────────
  return (
    <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>

      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}
          disabled={bookingStatus === 'loading'}
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
          Revisa los detalles y confirma para crear la reserva.
        </p>
      </div>

      {/* Summary card */}
      <div className="summary-card" style={{ marginBottom: '2rem' }}>
        <div className="summary-card-header">
          <img
            src={court.imagen_url}
            alt={court.nombre}
            style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
          />
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{court.nombre}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{court.descripcion}</p>
          </div>
        </div>

        <div className="summary-card-body">
          <div className="summary-row">
            <span className="summary-label"><Calendar size={15} /> Fecha</span>
            <span className="summary-value" style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Clock size={15} /> Hora</span>
            <span className="summary-value">{hour}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Timer size={15} /> Duración</span>
            <span className="summary-value">1 hora</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Wallet size={15} /> Precio por hora</span>
            <span className="summary-value-accent">${court.precio_hora.toLocaleString('es-CO')} COP</span>
          </div>
          <div className="summary-row" style={{ paddingTop: '1.25rem', marginTop: '0.5rem', borderTop: '2px solid rgba(255,255,255,0.07)' }}>
            <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              <Receipt size={15} /> Total a pagar
            </span>
            <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
              ${court.precio_hora.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {bookingStatus === 'error' && (
        <div className="status-banner status-banner-error" style={{ marginBottom: '1.5rem' }}>
          <XCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600 }}>No se pudo crear la reserva</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.2rem' }}>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Action footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
          style={{ padding: '0.9rem 1.75rem' }}
          disabled={bookingStatus === 'loading'}
        >
          <ArrowLeft size={16} /> Cambiar selección
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConfirmBooking}
          disabled={bookingStatus === 'loading'}
          style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
        >
          {bookingStatus === 'loading' ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creando reserva...</>
          ) : (
            <><CheckCircle size={16} /> Confirmar reserva</>
          )}
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
