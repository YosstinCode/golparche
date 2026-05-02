const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /fields
 * Retorna todas las canchas desde Supabase.
 * Query params opcionales: tipo (futbol5|futbol7|tenis|baloncesto)
 */
router.get('/', async (req, res) => {
  const { tipo } = req.query;

  let query = supabaseAdmin.from('canchas').select('*').order('id');

  if (tipo) {
    query = query.eq('tipo', tipo);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/**
 * GET /fields/:id
 * Retorna el detalle de una cancha específica.
 */
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('canchas')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Cancha no encontrada.' });
  }

  res.json(data);
});

module.exports = router;
