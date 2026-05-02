# 🚀 GolParche - Incrementos XP basados en BPMN

## 🎯 Objetivo
Dividir el desarrollo en incrementos funcionales, donde cada integrante implemente una parte completa del flujo hasta lograr la reserva completa.

---

## 🥇 Incremento 1 – Consulta y selección

### 🎯 Objetivo
Permitir al usuario:
- Ingresar al sistema
- Ver canchas disponibles
- Seleccionar fecha y hora

### 🔧 Backend
- GET /fields → listar canchas
- GET /availability?cancha_id&fecha → consultar disponibilidad (puede ser simulado)

### 🖥️ Frontend
- Lista de canchas
- Selector de fecha
- Selector de hora

### ✅ Resultado esperado
El usuario puede seleccionar una cancha con fecha y hora.

---

## 🥈 Incremento 2 – Validación de disponibilidad

### 🎯 Objetivo
Validar si el horario está disponible o no.

### 🔧 Backend
- Validar si ya existe una reserva con la misma:
  - cancha_id
  - fecha
  - hora

Ejemplo:
if (ocupado) return "no disponible"

### 🖥️ Frontend
- Mostrar mensaje:
  - ❌ “Horario no disponible”
  - ✅ Permitir continuar si está libre

### ✅ Resultado esperado
El sistema decide si el flujo continúa o termina.

---

## 🥉 Incremento 3 – Confirmar reserva + cálculo de total

### 🎯 Objetivo
Crear la reserva y mostrar el valor a pagar.

### 🔧 Backend
- POST /bookings
- Guardar:
  - cancha_id
  - fecha
  - hora
  - estado: "pendiente"
- Calcular precio total

### 🖥️ Frontend
- Botón: “Confirmar reserva”
- Mostrar total a pagar

### ✅ Resultado esperado
El usuario confirma la reserva y ve el valor a pagar.

---

## 🏁 Incremento 4 – Pago y validación

### 🎯 Objetivo
Simular el pago y validarlo.

### 🔧 Backend
- POST /payments
- Lógica:
  - Si pago válido → estado = "pagado"
  - Si no → error

Ejemplo:
if (pagoValido) estado = "pagado"
else throw error

### 🖥️ Frontend
- Botón: “Pagar”
- Mostrar:
  - ✅ Pago aprobado
  - ❌ Pago rechazado

### ✅ Resultado esperado
El sistema valida si el pago fue exitoso o no.

---

## 🧩 Incremento 5 – Confirmación final

### 🎯 Objetivo
Cerrar el flujo de reserva.

### 🔧 Backend
- PATCH /bookings/:id/confirm
- Cambiar estado:
  - "pagado" → "confirmado"
- Guardar reserva definitiva

### 🖥️ Frontend
- Mostrar:
  - “Reserva confirmada”
  - “Comprobante enviado”

### ✅ Resultado esperado
Se completa el flujo:
✔ Reserva confirmada  
✔ Reserva completada  

---

## 🔥 Flujo completo del sistema

Ver canchas → Seleccionar horario → Validar disponibilidad → Reservar → Pagar → Confirmar