import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  PartyPopper,
  Calendar,
  Clock,
  CreditCard,
  Receipt,
  Mail,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Star,
  Home,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const Confirmation = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const { booking, transaccion_id, card_last4 } = location.state || {};

  const [status, setStatus]     = useState('idle');   // idle | loading | confirmed | error
  const [confirmed, setConfirmed] = useState(null);
  const [errorMsg, setErrorMsg]  = useState('');

  // Guard
  useEffect(() => {
    if (!booking) navigate('/');
  }, [booking, navigate]);

  if (!booking) return null;

  // ── Incremento 5: call PATCH /bookings/:id/confirm ──────────────
  const handleConfirm = async () => {
    setStatus('loading');
    try {
      const res  = await fetch(`${API_BASE_URL}/bookings/${booking.id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al confirmar');

      setConfirmed(data.reserva);
      setStatus('confirmed');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  // ── Confirmed: final success screen ─────────────────────────────
  if (status === 'confirmed' && confirmed) {
    return (
      <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: '580px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* Confetti-style rings */}
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.15)', animation: 'ping 1.5s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '2px solid rgba(34,197,94,0.25)', animation: 'ping 1.5s ease-out 0.3s infinite' }} />
            <div style={{
              position: 'absolute', inset: '16px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid rgba(34,197,94,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(34,197,94,0.3)',
            }}>
              <CheckCircle size={36} style={{ color: 'var(--success-color)' }} />
            </div>
          </div>

          <h2 style={{ margin: '0 0 0.5rem', color: 'var(--success-color)', fontSize: '1.75rem' }}>
            ¡Reserva confirmada!
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Tu reserva está <strong style={{ color: 'var(--success-color)' }}>CONFIRMADA</strong>. ¡Nos vemos en la cancha!
          </p>
        </div>

        {/* Voucher card */}
        <div className="summary-card" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, var(--success-color), var(--primary-color))',
          }} />

          <div className="summary-card-header" style={{ paddingTop: '1.75rem' }}>
            <ShieldCheck size={24} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Comprobante enviado</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.1rem' }}>
                ID: {confirmed.id.split('-')[0].toUpperCase()}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className="badge badge-success">
                <CheckCircle size={11} /> CONFIRMADO
              </span>
            </div>
          </div>

          <div className="summary-card-body">
            <div className="summary-row">
              <span className="summary-label"><Star size={14} /> Cancha</span>
              <span className="summary-value">{confirmed.cancha_nombre}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><Calendar size={14} /> Fecha</span>
              <span className="summary-value">{confirmed.fecha}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><Clock size={14} /> Hora</span>
              <span className="summary-value">{confirmed.hora}</span>
            </div>
            {transaccion_id && (
              <div className="summary-row">
                <span className="summary-label"><CreditCard size={14} /> Transacción</span>
                <span className="summary-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{transaccion_id}</span>
              </div>
            )}
            <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                <Receipt size={15} /> Total pagado
              </span>
              <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
                ${confirmed.precio_total.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Dashed separator (voucher look) */}
          <div style={{ margin: '0 1.5rem', borderTop: '2px dashed rgba(255,255,255,0.07)' }} />

          {/* Email notice */}
          <div style={{ padding: '1.25rem 2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Mail size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Un comprobante fue enviado a tu correo registrado.
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
          style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
        >
          <Home size={16} /> Hacer otra reserva
        </button>

        <style>{`
          @keyframes pageSlideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
          @keyframes ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
        `}</style>
      </div>
    );
  }

  // ── Default: pre-confirmation summary ───────────────────────────
  return (
    <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: '580px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}
          disabled={status === 'loading'}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Confirmar tu reserva</h2>
          <span className="badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle size={11} /> Pago aprobado
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Tu pago fue procesado. Da clic en <strong>"Confirmar reserva"</strong> para finalizar el proceso y recibir tu comprobante.
        </p>
      </div>

      {/* Booking summary */}
      <div className="summary-card" style={{ marginBottom: '2rem' }}>
        <div className="summary-card-header">
          <PartyPopper size={22} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700 }}>Resumen final</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontFamily: 'monospace' }}>
              ID: {booking.id.split('-')[0].toUpperCase()}
            </div>
          </div>
        </div>
        <div className="summary-card-body">
          <div className="summary-row">
            <span className="summary-label"><Star size={14} /> Cancha</span>
            <span className="summary-value">{booking.cancha_nombre}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Calendar size={14} /> Fecha</span>
            <span className="summary-value">{booking.fecha}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Clock size={14} /> Hora</span>
            <span className="summary-value">{booking.hora}</span>
          </div>
          {transaccion_id && (
            <div className="summary-row">
              <span className="summary-label"><CreditCard size={14} /> Transacción</span>
              <span className="summary-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{transaccion_id}</span>
            </div>
          )}
          <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              <Receipt size={15} /> Total
            </span>
            <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
              ${booking.precio_total.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {status === 'error' && (
        <div className="status-banner status-banner-error" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600 }}>Error al confirmar</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.2rem' }}>{errorMsg}</div>
        </div>
      )}

      {/* CTA */}
      <button
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={status === 'loading'}
        style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
      >
        {status === 'loading' ? (
          <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Confirmando...</>
        ) : (
          <><CheckCircle size={18} /> Confirmar reserva definitivamente</>
        )}
      </button>

      <style>{`
        @keyframes pageSlideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
};

export default Confirmation;
