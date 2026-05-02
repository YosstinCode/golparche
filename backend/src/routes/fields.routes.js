const express = require('express');
const router = express.Router();

// Mock data for fields
const mockFields = [
  {
    id: 1,
    name: 'Cancha Principal - La 10',
    description: 'Cancha de césped sintético para fútbol 5.',
    price_per_hour: 50000,
    image_url: 'https://images.unsplash.com/photo-1518605368461-1e1e38ce8ba6?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Cancha Los Cracks',
    description: 'Cancha techada para fútbol 5, ideal para días de lluvia.',
    price_per_hour: 60000,
    image_url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2029&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Cancha El Potrero',
    description: 'Cancha exterior para fútbol 7.',
    price_per_hour: 80000,
    image_url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2070&auto=format&fit=crop'
  }
];

router.get('/', (req, res) => {
  res.json(mockFields);
});

module.exports = router;
