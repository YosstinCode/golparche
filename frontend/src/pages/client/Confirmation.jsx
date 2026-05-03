import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Clock,
  CreditCard,
  Receipt,
  ArrowLeft,
  ShieldCheck,
  Star,
  Home,
  Clock3
} from 'lucide-react';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // booking can come from Payment.jsx (as booking) or MyBookings.jsx (as confirmedBooking)
  const { booking: paymentBooking, confirmedBooking, transaccion_id } = location.state || {};
  const bookingData = confirmedBooking || paymentBooking;

  // Guard
  useEffect(() => {
    if (!bookingData) navigate('/');
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const isConfirmed = bookingData.estado === 'confirmado' || bookingData.estado === 'completada';
  const isPaid = bookingData.estado === 'pagado';

  return (
    <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: '580px', margin: '0 auto' }}>
      {/* Header Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate('/my-bookings')}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Ver mis reservas
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        {isConfirmed ? (
          <>
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
              ¡Reserva Confirmada!
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Tu reserva ha sido aprobada. ¡Nos vemos en la cancha!
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 1.5rem',
              borderRadius: '50%', background: 'rgba(96,165,250,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(96,165,250,0.5)'
            }}>
              <Clock3 size={32} style={{ color: '#60a5fa' }} />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#60a5fa', fontSize: '1.75rem' }}>
              Pago en Revisión
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Hemos recibido tu pago. El administrador confirmará tu reserva pronto.
            </p>
          </>
        )}
      </div>

      {/* Voucher card */}
      <div className="summary-card" style={{ marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: isConfirmed 
            ? 'linear-gradient(90deg, var(--success-color), var(--primary-color))'
            : 'linear-gradient(90deg, #60a5fa, #3b82f6)'
        }} />

        <div className="summary-card-header" style={{ paddingTop: '1.75rem' }}>
          <ShieldCheck size={24} style={{ color: isConfirmed ? 'var(--success-color)' : '#60a5fa', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Detalles de la Reserva</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.1rem' }}>
              ID: {bookingData.id.split('-')[0].toUpperCase()}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {isConfirmed ? (
              <span className="badge badge-success"><CheckCircle size={11} /> CONFIRMADA</span>
            ) : (
              <span className="badge" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}><Clock3 size={11} /> PAGADA</span>
            )}
          </div>
        </div>

        <div className="summary-card-body">
          <div className="summary-row">
            <span className="summary-label"><Star size={14} /> Cancha</span>
            <span className="summary-value">{bookingData.cancha_nombre || bookingData.canchas?.nombre}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Calendar size={14} /> Fecha</span>
            <span className="summary-value">{bookingData.fecha}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label"><Clock size={14} /> Hora</span>
            <span className="summary-value">{bookingData.hora}</span>
          </div>
          
          {isConfirmed && bookingData.codigo_reserva && (
            <div className="summary-row" style={{ background: 'rgba(74,222,128,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <span className="summary-label" style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Código de Acceso</span>
              <span className="summary-value" style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
                {bookingData.codigo_reserva}
              </span>
            </div>
          )}

          {transaccion_id && (
            <div className="summary-row" style={{ marginTop: '0.5rem' }}>
              <span className="summary-label"><CreditCard size={14} /> Transacción</span>
              <span className="summary-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{transaccion_id}</span>
            </div>
          )}

          <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              <Receipt size={15} /> Total pagado
            </span>
            <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
              ${bookingData.precio_total?.toLocaleString('es-CO')} COP
            </span>
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
};

export default Confirmation;
