import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, Lock, ArrowLeft, 
  ChevronRight, Calendar, Clock, MapPin, 
  AlertCircle, CheckCircle2, Loader2, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { booking } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    if (!booking) navigate('/');
  }, [booking, navigate]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Formatting logic
    if (name === 'number') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (name === 'cvc') {
      value = value.replace(/\D/g, '').substring(0, 3);
    }
    if (name === 'name') {
      value = value.toUpperCase();
    }

    setCardData({ ...cardData, [name]: value });
  };

  const validateCard = () => {
    const num = cardData.number.replace(/\s/g, '');
    if (num.length !== 16) return 'Número de tarjeta inválido.';
    
    const [month, year] = cardData.expiry.split('/');
    const m = parseInt(month);
    if (!m || m < 1 || m > 12) return 'Mes de expiración inválido.';
    
    const now = new Date();
    const currentYearShort = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    const expYear = parseInt(year);
    const expMonth = parseInt(month);

    if (expYear < currentYearShort || (expYear === currentYearShort && expMonth < currentMonth)) {
      return 'La tarjeta ha expirado.';
    }
    
    if (cardData.cvc.length < 3) return 'CVC inválido.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id, // Corregido: antes era usuario_id
          cancha_id: booking.cancha_id,
          fecha: booking.fecha,
          hora: booking.hora,
          precio_total: booking.precio_total
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/confirmation', { state: { booking: data.reserva } });
      } else {
        setError(data.error || 'Hubo un problema al procesar tu pago.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="payment-page animate-fade">
      <div className="payment-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> <span>Revisar horario</span>
        </button>
        <h1 className="payment-title">Finalizar <span className="text-gradient">Pago</span></h1>
      </div>

      <div className="payment-grid">
        {/* Left: Form */}
        <div className="payment-form-panel glass-card">
          <div className="secure-badge">
            <ShieldCheck size={18} />
            <span>Pago Seguro Encriptado SSL</span>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label className="form-label">Titular de la Tarjeta</label>
              <input
                name="name"
                type="text"
                className="form-input"
                placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                style={{ textTransform: 'uppercase' }}
                value={cardData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número de Tarjeta</label>
              <div className="card-input-wrapper">
                <CreditCard className="input-icon" size={20} />
                <input
                  name="number"
                  type="text"
                  className="form-input with-icon"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiración</label>
                <input
                  name="expiry"
                  type="text"
                  className="form-input"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVC / CVV</label>
                <div className="card-input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    name="cvc"
                    type="password"
                    className="form-input with-icon"
                    placeholder="•••"
                    value={cardData.cvc}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="payment-error animate-slide">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <Loader2 className="spinner-sm animate-spin" />
              ) : (
                <>Pagar ${(booking.precio_total).toLocaleString('es-CO')} <ChevronRight size={20} /></>
              )}
            </button>
          </form>

          <div className="payment-trust">
            <div className="trust-item">
              <CheckCircle2 size={16} /> <span>Cancelación gratuita (24h antes)</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} /> <span>Confirmación inmediata</span>
            </div>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="payment-summary-panel">
          <div className="summary-card glass-card">
            <h3 className="summary-card-title">Resumen de Reserva</h3>
            
            <div className="summary-court-info">
              <img src={booking.imagen_url} alt={booking.cancha_nombre} className="summary-img" />
              <div>
                <h4 className="summary-court-name">{booking.cancha_nombre}</h4>
                <div className="summary-meta"><MapPin size={12} /> Girardot, Cundinamarca</div>
              </div>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span className="row-label"><Calendar size={14} /> Fecha</span>
                <span className="row-value">{booking.fecha}</span>
              </div>
              <div className="summary-row">
                <span className="row-label"><Clock size={14} /> Horario</span>
                <span className="row-value">{booking.hora.substring(0, 5)} - 60 min</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Subtotal</span>
                <span className="row-value">${booking.precio_total.toLocaleString('es-CO')}</span>
              </div>
              <div className="summary-row">
                <span className="row-label">Tasa de servicio</span>
                <span className="row-value">$0</span>
              </div>
              <div className="total-row">
                <span className="total-label">Total a Pagar</span>
                <span className="total-value">${booking.precio_total.toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          </div>

          <div className="payment-info-box">
            <Info size={20} />
            <p>Al completar el pago, recibirás un código QR único que deberás presentar al ingresar a las instalaciones.</p>
          </div>
        </div>
      </div>

      <style>{`
        .payment-page { padding-bottom: 5rem; }
        .payment-header { margin-bottom: 3rem; text-align: center; }
        .btn-back {
          background: transparent;
          border: none;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 1rem;
          transition: var(--transition);
        }
        .btn-back:hover { color: var(--primary); }
        .payment-title { font-size: 3rem; }

        .payment-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        /* Form Panel */
        .payment-form-panel { padding: 3rem; }
        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 2.5rem;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .card-input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
        .form-input.with-icon { padding-left: 3.25rem; }

        .payment-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .btn-full { width: 100%; padding: 1.1rem; font-size: 1.1rem; margin-top: 1rem; }

        .payment-trust {
          display: flex;
          gap: 2rem;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .trust-item { display: flex; align-items: center; gap: 0.6rem; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
        .trust-item svg { color: var(--success); }

        /* Summary Panel */
        .summary-card { padding: 2rem; }
        .summary-card-title { font-size: 1.5rem; margin-bottom: 1.5rem; }
        .summary-court-info {
          display: flex;
          gap: 1.25rem;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .summary-img { width: 80px; height: 80px; border-radius: 16px; object-fit: cover; }
        .summary-court-name { font-size: 1.2rem; margin-bottom: 0.25rem; }
        .summary-meta { font-size: 0.8rem; color: var(--text-dim); display: flex; align-items: center; gap: 0.4rem; }

        .summary-details { display: grid; gap: 1rem; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: var(--text-muted); }
        .row-label { display: flex; align-items: center; gap: 0.6rem; }
        .row-value { color: var(--text-main); font-weight: 600; }

        .total-row {
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px dashed rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .total-label { font-weight: 700; color: var(--text-main); font-size: 1rem; }
        .total-value { font-size: 1.75rem; font-weight: 800; color: var(--accent); font-family: 'Outfit', sans-serif; }

        .payment-info-box {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(0, 210, 255, 0.05);
          border: 1px solid rgba(0, 210, 255, 0.1);
          border-radius: 20px;
          display: flex;
          gap: 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .payment-info-box svg { color: var(--primary); flex-shrink: 0; }

        @media (max-width: 1024px) {
          .payment-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Payment;
