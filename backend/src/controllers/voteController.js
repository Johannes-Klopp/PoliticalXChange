const db = require('../config/database');
const crypto = require('crypto');

// Submit a vote (up to 8 candidates)
const submitVote = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { token, candidateIds } = req.body;

    // Verify token hasn't been used (from middleware)
    const votingToken = req.votingToken;

    // Validate candidateIds array
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Mindestens ein Kandidat muss ausgewählt werden' });
    }

    if (candidateIds.length > 8) {
      await connection.rollback();
      return res.status(400).json({ error: 'Maximal 8 Kandidaten können gewählt werden' });
    }

    // Verify all candidates exist
    const placeholders = candidateIds.map(() => '?').join(',');
    const [candidates] = await connection.query(
      `SELECT id FROM candidates WHERE id IN (${placeholders})`,
      candidateIds
    );

    if (candidates.length !== candidateIds.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Ein oder mehrere Kandidaten nicht gefunden' });
    }

    // Generate unique session ID for this vote
    const voteSessionId = crypto.randomBytes(32).toString('hex');

    // Mark token as used
    const ip = req.ip || req.connection.remoteAddress;
    await connection.query(
      'UPDATE voting_tokens SET used = TRUE, used_at = NOW(), ip_address = ? WHERE id = ?',
      [ip, votingToken.id]
    );

    // Record votes (anonymized - no link to token/email)
    for (const candidateId of candidateIds) {
      await connection.query(
        'INSERT INTO votes (vote_session_id, candidate_id) VALUES (?, ?)',
        [voteSessionId, candidateId]
      );
    }

    await connection.commit();

    res.json({
      message: `Ihre ${candidateIds.length} Stimme(n) wurde(n) erfolgreich abgegeben`,
      success: true,
      votedCount: candidateIds.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Fehler beim Abgeben der Stimme' });
  } finally {
    connection.release();
  }
};

// Verify token validity (without using it)
const verifyToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Kein Token bereitgestellt' });
    }

    const [rows] = await db.query(
      'SELECT id, expires_at, used FROM voting_tokens WHERE token = ?',
      [token]
    );

    if (rows.length === 0) {
      return res.json({ valid: false, reason: 'Token nicht gefunden' });
    }

    const tokenData = rows[0];

    if (tokenData.used) {
      return res.json({ valid: false, reason: 'Token wurde bereits verwendet' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.json({ valid: false, reason: 'Token ist abgelaufen' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Fehler bei der Token-Verifizierung' });
  }
};

// Get voting results (Admin only)
const getResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.facility_name,
        c.facility_location,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id
      ORDER BY vote_count DESC, c.name ASC
    `);

    const [totalVotes] = await db.query('SELECT COUNT(*) as total FROM votes');

    res.json({
      results,
      totalVotes: totalVotes[0].total
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Ergebnisse' });
  }
};

// Export results to Excel format (Admin only)
const exportResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        c.name as 'Name',
        c.age as 'Alter',
        c.facility_name as 'Einrichtung',
        c.facility_location as 'Standort',
        COUNT(v.id) as 'Stimmen'
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id
      ORDER BY COUNT(v.id) DESC, c.name ASC
    `);

    // Return CSV format for Excel
    const headers = Object.keys(results[0] || {});
    const csv = [
      headers.join(','),
      ...results.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="wahlergebnisse.csv"');
    res.send('\uFEFF' + csv); // UTF-8 BOM for Excel
  } catch (error) {
    console.error('Error exporting results:', error);
    res.status(500).json({ error: 'Fehler beim Exportieren der Ergebnisse' });
  }
};

module.exports = {
  submitVote,
  verifyToken,
  getResults,
  exportResults,
};
