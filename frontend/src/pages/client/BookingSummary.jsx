import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, loading, success, error
  const [bookingDetails, setBookingDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { court, date, hour } = location.state || {};

  // Guard: if someone navigates here directly without state, redirect home
  useEffect(() => {
    if (!court || !date || !hour) {
      navigate('/');
    }
  }, [court, date, hour, navigate]);

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

  const handleConfirmBooking = async () => {
    setBookingStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancha_id: court.id,
          fecha: date,
          hora: hour
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la reserva');
      }

      setBookingStatus('success');
      setBookingDetails(data.reserva);

    } catch (error) {
      setBookingStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      {bookingStatus === 'success' && bookingDetails ? (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '30px' }}>
            <CheckCircle size={32} />
          </div>
          <h3 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>¡Reserva Pendiente Creada!</h3>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem' }}>
            <p><strong>Cancha:</strong> {bookingDetails.cancha_nombre || court.name}</p>
            <p><strong>Fecha:</strong> {bookingDetails.fecha || date}</p>
            <p><strong>Hora:</strong> {bookingDetails.hora || hour}</p>
            <hr style={{ borderColor: 'var(--surface-light)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem' }}>
              <span>Total a pagar:</span>
              <span className="text-gradient" style={{ fontWeight: 'bold' }}>
                ${(bookingDetails.precio_total || court.price_per_hour).toLocaleString('es-CO')}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>
              Estado: <span style={{ color: 'var(--accent-color)' }}>{(bookingDetails.estado || 'PENDIENTE').toUpperCase()}</span>
            </p>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Para asegurar tu cupo, debes realizar el pago a continuación.
          </p>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.125rem' }}
            onClick={() => navigate('/payment')}
          >
            Ir a Pagar
          </button>
        </div>
      ) : (
        <>
          {/* Page Header */}
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
              Tu horario fue validado. Revisa los detalles y confirma tu reserva.
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

          {bookingStatus === 'error' && (
            <div className="status-banner status-banner-error" style={{ marginBottom: '2rem' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600 }}>Error al crear la reserva</div>
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
              style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
              onClick={handleConfirmBooking}
              disabled={bookingStatus === 'loading'}
            >
              {bookingStatus === 'loading' ? (
                <><Loader2 size={16} className="spinner-sm" style={{ border: 'none', animation: 'spin 1s linear infinite' }} /> Creando...</>
              ) : (
                <><CheckCircle size={16} /> Confirmar reserva</>
              )}
            </button>
          </div>
        </>
      )}
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
