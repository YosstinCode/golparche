const express = require('express');
const router = express.Router();

// Simulated availability
const getAllHours = () => {
  const hours = [];
  for (let i = 14; i <= 22; i++) {
    hours.push(`${i}:00`);
  }
  return hours;
};

router.get('/', (req, res) => {
  const { cancha_id, fecha } = req.query;

  if (!cancha_id || !fecha) {
    return res.status(400).json({ error: 'cancha_id and fecha are required' });
  }

  // Simulate some hours being taken randomly to make it realistic
  // Let's make it deterministic based on the date/id combination to avoid flickering
  const seed = parseInt(cancha_id) + new Date(fecha).getDate();
  const allHours = getAllHours();
  
  const availableHours = allHours.filter((hour, index) => {
    // Arbitrary logic to mock taken hours
    return (seed + index) % 3 !== 0; 
  });

  res.json({
    cancha_id,
    fecha,
    available_hours: availableHours
  });
});

module.exports = router;
