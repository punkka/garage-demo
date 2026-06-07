import { Router } from 'express';
import pool from './db';
import { calculateParkingCost } from './pricing';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FILTER (WHERE is_vacant) AS available_spaces FROM parking_spaces');
    const availableSpaces = Number(result.rows[0].available_spaces ?? 0);
    res.json({ availableSpaces, isFull: availableSpaces === 0 });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load garage status.' });
  }
});

router.get('/spaces', async (req, res) => {
  try {
    const result = await pool.query('SELECT space_number, is_vacant FROM parking_spaces ORDER BY space_number');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load parking spaces.' });
  }
});

router.post('/entry', async (req, res) => {
  const { licensePlate, spaceNumber } = req.body;

  if (!licensePlate || typeof licensePlate !== 'string' || !spaceNumber || typeof spaceNumber !== 'number') {
    return res.status(400).json({ error: 'licensePlate and spaceNumber are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const normalizedPlate = licensePlate.trim().toUpperCase();

    const activeSessionResult = await client.query(
      'SELECT id FROM parking_sessions WHERE license_plate = $1 AND exited_at IS NULL FOR UPDATE',
      [normalizedPlate]
    );

    if (activeSessionResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This registration number already has an active parking session.' });
    }

    const spaceResult = await client.query(
      'SELECT is_vacant FROM parking_spaces WHERE space_number = $1 FOR UPDATE',
      [spaceNumber]
    );

    if (spaceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Parking space not found.' });
    }

    if (!spaceResult.rows[0].is_vacant) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Parking space is already occupied.' });
    }

    await client.query(
      'UPDATE parking_spaces SET is_vacant = FALSE WHERE space_number = $1',
      [spaceNumber]
    );

    await client.query(
      'INSERT INTO parking_sessions (license_plate, space_number, entered_at) VALUES ($1, $2, NOW())',
      [normalizedPlate, spaceNumber]
    );

    await client.query('COMMIT');
    res.json({ message: 'Car entered successfully.', licensePlate, spaceNumber });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Unable to register entry.' });
  } finally {
    client.release();
  }
});

router.post('/exit', async (req, res) => {
  const { licensePlate } = req.body;

  if (!licensePlate || typeof licensePlate !== 'string') {
    return res.status(400).json({ error: 'licensePlate is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      'SELECT id, space_number, entered_at FROM parking_sessions WHERE license_plate = $1 AND exited_at IS NULL FOR UPDATE',
      [licensePlate.trim().toUpperCase()]
    );

    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No active parking session found for this license plate.' });
    }

    const session = sessionResult.rows[0];
    const enteredAt = new Date(session.entered_at);
    const now = new Date();
    const { totalMinutes, priceCents } = calculateParkingCost(enteredAt, now);

    await client.query(
      'UPDATE parking_sessions SET exited_at = NOW(), price_cents = $1 WHERE id = $2',
      [priceCents, session.id]
    );

    await client.query(
      'UPDATE parking_spaces SET is_vacant = TRUE WHERE space_number = $1',
      [session.space_number]
    );

    await client.query('COMMIT');

    res.json({ message: 'Car exited successfully.', licensePlate, spaceNumber: session.space_number, parkedMinutes: totalMinutes, costCents: priceCents });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Unable to process exit.' });
  } finally {
    client.release();
  }
});

router.get('/admin/parked', async (req, res) => {
  try {
    const activeResult = await pool.query(
      `SELECT p.space_number, s.license_plate, s.entered_at
       FROM parking_sessions s
       JOIN parking_spaces p ON p.space_number = s.space_number
       WHERE s.exited_at IS NULL
       ORDER BY p.space_number`
    );

    const activeCars = activeResult.rows.map((row: { space_number: number; license_plate: string; entered_at: string }) => ({
      spaceNumber: row.space_number,
      licensePlate: row.license_plate,
      enteredAt: row.entered_at,
    }));

    const availableResult = await pool.query(
      'SELECT COUNT(*) FILTER (WHERE is_vacant) AS available_spaces FROM parking_spaces'
    );

    res.json({ availableSpaces: Number(availableResult.rows[0].available_spaces ?? 0), activeCars });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load admin parking data.' });
  }
});

export default router;
