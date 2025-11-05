const db = require('../config/database');
const crypto = require('crypto');
const { sendVotingTokenEmail } = require('../utils/email');

// Add facility and send voting token
const addFacility = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, email, location } = req.body;

    if (!name || !email || !location) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Name, E-Mail und Standort sind erforderlich'
      });
    }

    // Check if facility already exists
    const [existing] = await connection.query(
      'SELECT id FROM facilities WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Diese E-Mail-Adresse ist bereits registriert'
      });
    }

    // Insert facility
    const [facilityResult] = await connection.query(
      'INSERT INTO facilities (name, email, location) VALUES (?, ?, ?)',
      [name, email, location]
    );

    const facilityId = facilityResult.insertId;

    // Generate voting token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(process.env.ELECTION_END_DATE || '2025-11-30T23:59:59Z');

    await connection.query(
      'INSERT INTO voting_tokens (facility_id, token, expires_at) VALUES (?, ?, ?)',
      [facilityId, token, expiresAt]
    );

    await connection.commit();

    // Send email with voting link
    const votingLink = `${process.env.FRONTEND_URL}/vote/${token}`;

    try {
      await sendVotingTokenEmail(email, name, votingLink);

      await db.query(
        'UPDATE facilities SET token_sent = TRUE WHERE id = ?',
        [facilityId]
      );

      res.status(201).json({
        message: 'Einrichtung hinzugefügt und Token per E-Mail versendet',
        facilityId,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(201).json({
        message: 'Einrichtung hinzugefügt, aber E-Mail konnte nicht versendet werden',
        facilityId,
        warning: 'E-Mail-Versand fehlgeschlagen',
        votingLink // Return link for manual sending
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error adding facility:', error);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Einrichtung' });
  } finally {
    connection.release();
  }
};

// Get all facilities (Admin only)
const getAllFacilities = async (req, res) => {
  try {
    const [facilities] = await db.query(
      'SELECT id, name, email, location, token_sent, created_at FROM facilities ORDER BY name ASC'
    );

    res.json({ facilities });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Einrichtungen' });
  }
};

// Bulk add facilities
const bulkAddFacilities = async (req, res) => {
  try {
    const { facilities } = req.body;

    if (!Array.isArray(facilities) || facilities.length === 0) {
      return res.status(400).json({ error: 'Ungültige Einrichtungsliste' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const facility of facilities) {
      try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        const [facilityResult] = await connection.query(
          'INSERT INTO facilities (name, email, location) VALUES (?, ?, ?)',
          [facility.name, facility.email, facility.location]
        );

        const facilityId = facilityResult.insertId;
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(process.env.ELECTION_END_DATE);

        await connection.query(
          'INSERT INTO voting_tokens (facility_id, token, expires_at) VALUES (?, ?, ?)',
          [facilityId, token, expiresAt]
        );

        await connection.commit();
        connection.release();

        // Send email
        const votingLink = `${process.env.FRONTEND_URL}/vote/${token}`;
        await sendVotingTokenEmail(facility.email, facility.name, votingLink);

        await db.query('UPDATE facilities SET token_sent = TRUE WHERE id = ?', [facilityId]);

        results.success.push({ name: facility.name, email: facility.email });
      } catch (error) {
        results.failed.push({
          name: facility.name,
          email: facility.email,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `${results.success.length} Einrichtungen hinzugefügt, ${results.failed.length} fehlgeschlagen`,
      results
    });
  } catch (error) {
    console.error('Error bulk adding facilities:', error);
    res.status(500).json({ error: 'Fehler beim Massenimport der Einrichtungen' });
  }
};

// Resend token to facility
const resendToken = async (req, res) => {
  try {
    const { facilityId } = req.params;

    const [facilities] = await db.query(
      'SELECT f.*, vt.token FROM facilities f JOIN voting_tokens vt ON f.id = vt.facility_id WHERE f.id = ? AND vt.used = FALSE',
      [facilityId]
    );

    if (facilities.length === 0) {
      return res.status(404).json({
        error: 'Einrichtung nicht gefunden oder Token bereits verwendet'
      });
    }

    const facility = facilities[0];
    const votingLink = `${process.env.FRONTEND_URL}/vote/${facility.token}`;

    await sendVotingTokenEmail(facility.email, facility.name, votingLink);

    res.json({ message: 'Token erfolgreich erneut versendet' });
  } catch (error) {
    console.error('Error resending token:', error);
    res.status(500).json({ error: 'Fehler beim erneuten Versenden des Tokens' });
  }
};

module.exports = {
  addFacility,
  getAllFacilities,
  bulkAddFacilities,
  resendToken,
};
