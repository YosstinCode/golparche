const express = require('express');
const cors = require('cors');

const fieldsRoutes = require('./routes/fields.routes');
const availabilityRoutes = require('./routes/availability.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const paymentsRoutes = require('./routes/payments.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/fields', fieldsRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/payments', paymentsRoutes);

app.get('/', (req, res) => {
  res.send('Golparche API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
