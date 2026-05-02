import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Banknote,
  Calendar,
  Clock,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

// ── Helpers ─────────────────────────────────────────────────────
const formatCardNumber = (val) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const maskCardNumber = (num) => {
  const clean = num.replace(/\s/g, '');
  if (clean.length < 4) return num;
  return `**** **** **** ${clean.slice(-4)}`;
};

// ── Component ────────────────────────────────────────────────────
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { booking } = location.state || {};

  const [form, setForm] = useState({
    card_number: '',
    card_holder: '',
    expiry: '',
    cvv: '',
  });
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | loading | approved | rejected
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);

  // Guard: redirect if arrived without booking data
  useEffect(() => {
    if (!booking) navigate('/');
  }, [booking, navigate]);

  if (!booking) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'card_number') setForm(f => ({ ...f, card_number: formatCardNumber(value) }));
    else if (name === 'expiry')  setForm(f => ({ ...f, expiry: formatExpiry(value) }));
    else if (name === 'cvv')     setForm(f => ({ ...f, cvv: value.replace(/\D/g, '').slice(0, 3) }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          card_number: form.card_number,
          card_holder: form.card_holder,
          expiry: form.expiry,
          cvv: form.cvv,
        }),
      });

      const data = await res.json();

      if (res.status === 402 || !data.approved) {
        setPaymentStatus('rejected');
        setErrorMessage(data.error || 'Pago rechazado');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      setResponseData(data);
      setPaymentStatus('approved');

      // Navigate to Increment 5 confirmation screen
      navigate('/confirmation', {
        state: {
          booking: data.reserva,
          transaccion_id: data.transaccion_id,
          card_last4: form.card_number.replace(/\s/g, '').slice(-4),
        },
      });

    } catch (err) {
      setPaymentStatus('rejected');
      setErrorMessage(err.message);
    }
  };

  const isFormValid =
    form.card_number.replace(/\s/g, '').length === 16 &&
    form.card_holder.trim().length > 2 &&
    form.expiry.length === 5 &&
    form.cvv.length === 3;

  // ── Approved view ────────────────────────────────────────────
  if (paymentStatus === 'approved' && responseData) {
    return (
      <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.25)',
            animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <CheckCircle size={42} style={{ color: 'var(--success-color)' }} />
          </div>
          <h2 style={{ margin: '0 0 0.5rem', color: 'var(--success-color)' }}>¡Pago aprobado!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Tu reserva ha sido pagada exitosamente.
          </p>
        </div>

        {/* Receipt card */}
        <div className="summary-card" style={{ marginBottom: '1.5rem' }}>
          <div className="summary-card-header">
            <ShieldCheck size={22} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700 }}>Comprobante de pago</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.1rem' }}>
                {responseData.transaccion_id}
              </div>
            </div>
          </div>
          <div className="summary-card-body">
            <div className="summary-row">
              <span className="summary-label"><Calendar size={14} /> Cancha</span>
              <span className="summary-value">{responseData.reserva.cancha_nombre}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><Calendar size={14} /> Fecha</span>
              <span className="summary-value">{responseData.reserva.fecha}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><Clock size={14} /> Hora</span>
              <span className="summary-value">{responseData.reserva.hora}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><CreditCard size={14} /> Tarjeta</span>
              <span className="summary-value">{maskCardNumber(form.card_number)}</span>
            </div>
            <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                <Banknote size={15} /> Total pagado
              </span>
              <span className="summary-value-accent" style={{ fontSize: '1.5rem' }}>
                ${responseData.reserva.precio_total.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <CheckCircle size={18} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>
            Estado de la reserva: <strong>PAGADO</strong>. Próximo paso: confirmación final (Incremento 5).
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
          Hacer otra reserva
        </button>

        <style>{`
          @keyframes pageSlideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
          @keyframes scaleIn { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
        `}</style>
      </div>
    );
  }

  // ── Payment form view ────────────────────────────────────────
  return (
    <div style={{ animation: 'pageSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}
          disabled={paymentStatus === 'loading'}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Pagar reserva</h2>
          <span className="badge" style={{ background: 'rgba(0,210,255,0.1)', color: 'var(--primary-color)', border: '1px solid rgba(0,210,255,0.3)' }}>
            <Lock size={11} /> Pago seguro
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Ingresa los datos de tu tarjeta para completar la reserva.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Left: Order summary */}
        <div>
          <div className="summary-card">
            <div className="summary-card-header">
              <Banknote size={20} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700 }}>Resumen del pedido</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  ID: {booking.id.split('-')[0].toUpperCase()}
                </div>
              </div>
            </div>
            <div className="summary-card-body">
              <div className="summary-row">
                <span className="summary-label"><Calendar size={14} /> Cancha</span>
                <span className="summary-value" style={{ fontSize: '0.9rem' }}>{booking.cancha_nombre}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label"><Calendar size={14} /> Fecha</span>
                <span className="summary-value">{booking.fecha}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label"><Clock size={14} /> Hora</span>
                <span className="summary-value">{booking.hora}</span>
              </div>
              <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <span className="summary-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                <span className="summary-value-accent" style={{ fontSize: '1.4rem' }}>
                  ${booking.precio_total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div style={{ marginTop: '1rem', background: 'rgba(252,163,17,0.08)', border: '1px solid rgba(252,163,17,0.25)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
            <AlertTriangle size={14} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '0.1rem' }} />
            <span>Usa CVV <strong style={{ color: 'var(--accent-color)' }}>000</strong> para simular un pago rechazado. Cualquier otro CVV aprueba el pago.</span>
          </div>
        </div>

        {/* Right: Card form */}
        <div>
          {/* Visual card */}
          <div
            className="credit-card-visual"
            style={{ marginBottom: '1.5rem', perspective: '1000px', cursor: 'default' }}
            onMouseEnter={() => setCardFlipped(form.cvv.length > 0)}
            onMouseLeave={() => setCardFlipped(false)}
          >
            <div style={{
              position: 'relative', width: '100%', paddingBottom: '56.25%',
              transition: 'transform 0.6s ease',
              transformStyle: 'preserve-3d',
              transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '16px',
                background: 'linear-gradient(135deg, #1a1f6b, #00d2ff)',
                padding: '1.5rem', backfaceVisibility: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px' }} />
                  <CreditCard size={28} style={{ color: 'rgba(255,255,255,0.8)' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
                    {form.card_number || '**** **** **** ****'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Titular</div>
                      <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{form.card_holder || 'NOMBRE APELLIDO'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Vence</div>
                      <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{form.expiry || 'MM/AA'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '16px',
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#1e293b', height: '45px', marginTop: '1.5rem' }} />
                <div style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CVV</div>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: '6px',
                    padding: '0.5rem 1rem', fontFamily: 'monospace',
                    fontSize: '1rem', letterSpacing: '0.3em', color: 'white',
                  }}>
                    {form.cvv ? '•'.repeat(form.cvv.length) : '•••'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="card_number">
                <CreditCard size={13} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                Número de tarjeta
              </label>
              <input
                id="card_number" name="card_number" type="text"
                className="form-control" placeholder="1234 5678 9012 3456"
                value={form.card_number} onChange={handleChange}
                disabled={paymentStatus === 'loading'}
                style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="card_holder">Nombre en la tarjeta</label>
              <input
                id="card_holder" name="card_holder" type="text"
                className="form-control" placeholder="NOMBRE APELLIDO"
                value={form.card_holder} onChange={handleChange}
                disabled={paymentStatus === 'loading'}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="expiry">Vencimiento</label>
                <input
                  id="expiry" name="expiry" type="text"
                  className="form-control" placeholder="MM/AA"
                  value={form.expiry} onChange={handleChange}
                  disabled={paymentStatus === 'loading'}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="cvv">
                  <Lock size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  CVV
                </label>
                <input
                  id="cvv" name="cvv" type="text"
                  className="form-control" placeholder="123"
                  value={form.cvv} onChange={handleChange}
                  onFocus={() => setCardFlipped(true)}
                  onBlur={() => setCardFlipped(false)}
                  disabled={paymentStatus === 'loading'}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.3em' }}
                />
              </div>
            </div>

            {/* Rejected banner */}
            {paymentStatus === 'rejected' && (
              <div className="status-banner status-banner-error" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                <XCircle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Pago rechazado</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.2rem' }}>{errorMessage}</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || paymentStatus === 'loading'}
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.05rem' }}
            >
              {paymentStatus === 'loading' ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Procesando pago...</>
              ) : (
                <><Lock size={16} /> Pagar ${booking.precio_total.toLocaleString('es-CO')} COP</>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes pageSlideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
};

export default Payment;
