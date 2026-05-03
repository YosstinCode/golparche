import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Calendar, Clock, MapPin, 
  Download, Share2, Home, ArrowRight, 
  QrCode, Info, AlertCircle, Printer
} from 'lucide-react';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  if (!booking) {
    return (
      <div className="error-container">
        <AlertCircle size={48} color="var(--danger)" />
        <h2>No se encontró información de la reserva</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  const isCancelled = booking.estado === 'cancelada';

  return (
    <div className="confirmation-page animate-fade">
      <div className="conf-header">
        <div className="success-icon-wrapper">
          {isCancelled ? <AlertCircle size={40} className="icon-cancelled" /> : <CheckCircle size={40} className="icon-success" />}
        </div>
        <h1 className="conf-title">
          {isCancelled ? 'Reserva ' : '¡Reserva '}
          <span className="text-gradient">{isCancelled ? 'Cancelada' : 'Confirmada'}!</span>
        </h1>
        <p className="conf-subtitle">
          {isCancelled 
            ? 'Tu reserva ha sido anulada exitosamente.' 
            : 'Todo listo. Hemos reservado tu lugar en la cancha.'}
        </p>
      </div>

      <div className="ticket-container">
        <div className="ticket glass-card">
          {/* Ticket Header */}
          <div className="ticket-top">
            <div className="ticket-court">
              <h2 className="ticket-court-name">{booking.cancha_nombre || 'Cancha Premium'}</h2>
              <div className="ticket-meta"><MapPin size={14} /> Sede Principal, Girardot</div>
            </div>
            <div className="ticket-status">
              <span className={`status-badge ${isCancelled ? 'status-danger' : 'status-success'}`}>
                {booking.estado.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="ticket-body">
            <div className="ticket-info-grid">
              <div className="info-item">
                <span className="info-label">Fecha</span>
                <div className="info-value">
                  <Calendar size={16} /> <span>{booking.fecha}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">Horario</span>
                <div className="info-value">
                  <Clock size={16} /> <span>{booking.hora?.substring(0, 5)} - 60 min</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">Código de Reserva</span>
                <div className="info-value code-value">
                  {booking.codigo_reserva || 'GP-XXXX'}
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">Monto Pagado</span>
                <div className="info-value price-value">
                  ${booking.precio_total?.toLocaleString('es-CO')}
                </div>
              </div>
            </div>

            {!isCancelled && (
              <div className="qr-section">
                <div className="qr-box">
                  <QrCode size={120} strokeWidth={1.5} />
                  <div className="qr-overlay">P-AUTH-{booking.id?.substring(0,4)}</div>
                </div>
                <p className="qr-hint">Presenta este código al llegar a las instalaciones</p>
              </div>
            )}
          </div>

          {/* Ticket Footer (Cut line effect) */}
          <div className="ticket-divider">
            <div className="cut-circle left"></div>
            <div className="cut-line"></div>
            <div className="cut-circle right"></div>
          </div>

          <div className="ticket-footer">
            <div className="footer-notice">
              <Info size={16} />
              <span>Por favor llega 15 minutos antes de tu turno.</span>
            </div>
          </div>
        </div>
      </div>

      {isCancelled && booking.precio_total > 0 && (
        <div className="refund-notice glass-card animate-slide">
          <AlertCircle size={24} color="var(--warning)" />
          <div>
            <h3>Información sobre Devolución</h3>
            <p>Al ser una reserva ya pagada, debes acercarte a nuestras instalaciones físicas con tu identificación para gestionar el reembolso del 100% de tu dinero.</p>
          </div>
        </div>
      )}

      <div className="conf-actions">
        {!isCancelled && (
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Printer size={18} /> Imprimir Recibo
            </button>
            <button className="btn btn-outline">
              <Share2 size={18} /> Compartir
            </button>
          </>
        )}
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Ir al Inicio <Home size={18} />
        </button>
      </div>

      <style>{`
        .confirmation-page { padding-bottom: 6rem; display: flex; flex-direction: column; align-items: center; }
        .conf-header { text-align: center; margin-bottom: 4rem; }
        
        .success-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(34, 197, 94, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
        }
        .icon-success { color: var(--success); }
        .icon-cancelled { color: var(--danger); }

        .conf-title { font-size: 3.5rem; margin-bottom: 1rem; }
        .conf-subtitle { color: var(--text-muted); font-size: 1.1rem; }

        .ticket-container { width: 100%; max-width: 500px; margin-bottom: 4rem; }
        .ticket { overflow: hidden; position: relative; border-radius: 32px; }
        
        .ticket-top { padding: 2.5rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed rgba(255,255,255,0.1); }
        .ticket-court-name { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .ticket-meta { color: var(--text-dim); font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; }

        .ticket-body { padding: 2.5rem; }
        .ticket-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .info-label { display: block; font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .info-value { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; color: white; }
        .info-value svg { color: var(--primary); }
        .code-value { color: var(--primary); font-family: monospace; font-size: 1.1rem; }
        .price-value { color: var(--accent); font-family: 'Outfit', sans-serif; font-size: 1.25rem; }

        .qr-section { text-align: center; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 24px; }
        .qr-box { position: relative; background: white; padding: 1.5rem; border-radius: 16px; display: inline-block; color: #000; margin-bottom: 1rem; }
        .qr-overlay { position: absolute; bottom: 0.5rem; left: 50%; transform: translateX(-50%); font-size: 0.6rem; font-weight: 800; opacity: 0.3; }
        .qr-hint { font-size: 0.8rem; color: var(--text-muted); }

        .ticket-divider { position: relative; height: 32px; margin: 0 -1rem; }
        .cut-line { position: absolute; top: 50%; left: 1rem; right: 1rem; border-top: 2px dashed rgba(255,255,255,0.1); }
        .cut-circle { position: absolute; width: 32px; height: 32px; background: var(--bg-deep); border-radius: 50%; top: 0; }
        .cut-circle.left { left: -16px; border-right: 1px solid rgba(255,255,255,0.08); }
        .cut-circle.right { right: -16px; border-left: 1px solid rgba(255,255,255,0.08); }

        .ticket-footer { padding: 2.5rem; background: rgba(255,255,255,0.01); }
        .footer-notice { display: flex; align-items: center; gap: 0.75rem; color: var(--text-dim); font-size: 0.85rem; }
        .footer-notice svg { color: var(--primary); }

        .refund-notice {
          max-width: 500px;
          padding: 2rem;
          margin-bottom: 3rem;
          display: flex;
          gap: 1.5rem;
          border-left: 4px solid var(--warning);
        }
        .refund-notice h3 { margin-bottom: 0.5rem; color: var(--warning); font-size: 1.1rem; }
        .refund-notice p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; }

        .conf-actions { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }

        .error-container { text-align: center; padding: 6rem 0; display: flex; flex-direction: column; align-items: center; gap: 2rem; }

        @media print {
          .main-header, .conf-actions, .hero-section { display: none !important; }
          .ticket-container { max-width: none; margin: 0; }
          .ticket { border: 1px solid #ddd; box-shadow: none; }
          body { background: white !important; color: black !important; }
          .ticket-body, .ticket-top, .ticket-footer { color: black !important; }
          .info-value, .ticket-court-name { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default Confirmation;
