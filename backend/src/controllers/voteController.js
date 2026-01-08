const db = require('../config/database');
const crypto = require('crypto');
const { auditLog } = require('../middleware/security');

// Verify email is registered for newsletter and can vote
const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-Mail-Adresse erforderlich' });
    }

    // Check if email is registered in newsletter
    const [subscriber] = await db.query(
      'SELECT id, group_name, facility_name, has_voted, voted_at FROM newsletter_subscriptions WHERE email = ? AND confirmed = TRUE',
      [email]
    );

    if (subscriber.length === 0) {
      return res.status(404).json({
        error: 'Diese E-Mail-Adresse ist nicht für die Wahl registriert. Bitte melden Sie sich zuerst für den Newsletter an.'
      });
    }

    const sub = subscriber[0];

    if (sub.has_voted) {
      return res.status(400).json({
        error: `Diese Wohngruppe (${sub.group_name}) hat bereits am ${new Date(sub.voted_at).toLocaleDateString('de-DE')} abgestimmt.`
      });
    }

    res.json({
      valid: true,
      groupName: sub.group_name,
      facilityName: sub.facility_name,
      message: 'E-Mail verifiziert. Sie können nun wählen.'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Fehler bei der E-Mail-Verifizierung' });
  }
};

// Submit vote with email verification (3 candidates)
const submitVoteWithEmail = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { email, candidateIds } = req.body;

    // Verify email
    if (!email) {
      await connection.rollback();
      return res.status(400).json({ error: 'E-Mail-Adresse erforderlich' });
    }

    // Check if email is registered and hasn't voted
    const [subscriber] = await connection.query(
      'SELECT id, group_name, facility_name, has_voted FROM newsletter_subscriptions WHERE email = ? AND confirmed = TRUE',
      [email]
    );

    if (subscriber.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Diese E-Mail-Adresse ist nicht für die Wahl registriert.'
      });
    }

    const sub = subscriber[0];

    if (sub.has_voted) {
      await connection.rollback();
      return res.status(400).json({
        error: `Diese Wohngruppe (${sub.group_name}) hat bereits abgestimmt.`
      });
    }

    // Validate candidateIds array
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Mindestens ein Kandidat muss ausgewählt werden' });
    }

    if (candidateIds.length > 8) {
      await connection.rollback();
      return res.status(400).json({ error: 'Maximal 8 Kandidaten können gewählt werden' });
    }

    // Remove duplicates
    const uniqueCandidateIds = [...new Set(candidateIds)];

    if (uniqueCandidateIds.length !== candidateIds.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'Jeder Kandidat kann nur einmal gewählt werden' });
    }

    // Verify all candidates exist
    const placeholders = uniqueCandidateIds.map(() => '?').join(',');
    const [candidates] = await connection.query(
      `SELECT id FROM candidates WHERE id IN (${placeholders})`,
      uniqueCandidateIds
    );

    if (candidates.length !== uniqueCandidateIds.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Ein oder mehrere Kandidaten nicht gefunden' });
    }

    // Generate unique session ID for this vote
    const voteSessionId = crypto.randomBytes(32).toString('hex');

    // Record votes (anonymized - no direct link to email)
    for (const candidateId of uniqueCandidateIds) {
      await connection.query(
        'INSERT INTO votes (vote_session_id, candidate_id) VALUES (?, ?)',
        [voteSessionId, candidateId]
      );
    }

    // Mark subscriber as voted
    await connection.query(
      'UPDATE newsletter_subscriptions SET has_voted = TRUE, voted_at = NOW() WHERE id = ?',
      [sub.id]
    );

    // Audit log (without storing email directly with votes)
    const ip = req.ip || req.connection.remoteAddress;
    await connection.query(
      'INSERT INTO audit_log (action, entity_type, details, ip_address) VALUES (?, ?, ?, ?)',
      ['VOTE_SUBMITTED', 'vote', JSON.stringify({
        groupName: sub.group_name,
        facilityName: sub.facility_name,
        votesCount: uniqueCandidateIds.length
      }), ip]
    );

    await connection.commit();

    res.json({
      message: `Vielen Dank! Ihre ${uniqueCandidateIds.length} Stimme(n) wurde(n) erfolgreich für die Wohngruppe "${sub.group_name}" abgegeben.`,
      success: true,
      votedCount: uniqueCandidateIds.length,
      groupName: sub.group_name
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Fehler beim Abgeben der Stimme' });
  } finally {
    connection.release();
  }
};

// Submit a vote (up to 8 candidates) - OLD TOKEN BASED METHOD
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

// Get voting results with statistics (Admin only)
const getResults = async (req, res) => {
  try {
    // Kandidaten mit Stimmzahlen
    const [results] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.youth_care_experience,
        c.fun_fact,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id
      ORDER BY vote_count DESC, c.name ASC
    `);

    // Gesamtzahl der Stimmen
    const [totalVotes] = await db.query('SELECT COUNT(*) as total FROM votes');

    // Anzahl der einzigartigen Wähler (wenn vote_session_id existiert)
    let uniqueVoters = [{count: 0}];
    let voteDistribution = [];

    try {
      [uniqueVoters] = await db.query('SELECT COUNT(DISTINCT vote_session_id) as count FROM votes WHERE vote_session_id IS NOT NULL');

      // Stimmverteilung nur wenn es Daten gibt
      if (uniqueVoters[0].count > 0) {
        [voteDistribution] = await db.query(`
          SELECT votes_per_session, COUNT(*) as count
          FROM (
            SELECT vote_session_id, COUNT(*) as votes_per_session
            FROM votes
            WHERE vote_session_id IS NOT NULL
            GROUP BY vote_session_id
          ) as session_counts
          GROUP BY votes_per_session
          ORDER BY votes_per_session
        `);
      }
    } catch (err) {
      // Fallback wenn vote_session_id nicht existiert
      console.log('vote_session_id not available');
      uniqueVoters = [{count: 0}];
    }

    // Newsletter Statistiken
    let totalSubscribers = [{total: 0}];
    let votedSubscribers = [{voted: 0}];
    let participationByFacility = [];
    let votingTimeline = [];

    try {
      [totalSubscribers] = await db.query('SELECT COUNT(*) as total FROM newsletter_subscriptions WHERE confirmed = TRUE');

      // Check if has_voted column exists
      [votedSubscribers] = await db.query('SELECT COUNT(*) as voted FROM newsletter_subscriptions WHERE has_voted = TRUE');

      // Wahlbeteiligung nach Einrichtung
      [participationByFacility] = await db.query(`
        SELECT
          COALESCE(facility_name, 'Nicht angegeben') as facility_name,
          SUM(CASE WHEN has_voted = TRUE THEN 1 ELSE 0 END) as voted,
          COUNT(*) as total,
          CASE
            WHEN COUNT(*) > 0
            THEN ROUND(SUM(CASE WHEN has_voted = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)
            ELSE 0
          END as percentage
        FROM newsletter_subscriptions
        WHERE confirmed = TRUE
        GROUP BY facility_name
        ORDER BY percentage DESC
      `);

      // Zeitlicher Verlauf der Wähler (nicht Stimmen)
      [votingTimeline] = await db.query(`
        SELECT
          DATE(voted_at) as date,
          COUNT(*) as voters_count
        FROM newsletter_subscriptions
        WHERE has_voted = TRUE AND voted_at IS NOT NULL
        GROUP BY DATE(voted_at)
        ORDER BY date
      `);
    } catch (err) {
      console.log('Newsletter voting columns not fully available');
    }

    const participationRate = totalSubscribers[0].total > 0
      ? Math.round((votedSubscribers[0].voted / totalSubscribers[0].total) * 100)
      : 0;

    res.json({
      results,
      statistics: {
        totalVotes: totalVotes[0].total,
        uniqueVoters: uniqueVoters[0].count,
        totalSubscribers: totalSubscribers[0].total,
        votedSubscribers: votedSubscribers[0].voted,
        participationRate,
        voteDistribution,
        participationByFacility,
        votingTimeline,
        averageVotesPerVoter: uniqueVoters[0].count > 0
          ? (totalVotes[0].total / uniqueVoters[0].count).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Ergebnisse' });
  }
};

// Export results to Excel format (Admin only)
const exportResults = async (req, res) => {
  try {
    const ExcelJS = require('exceljs');

    // Hole die Wahlergebnisse
    const [results] = await db.query(`
      SELECT
        ROW_NUMBER() OVER (ORDER BY COUNT(v.id) DESC, c.name ASC) as 'Platz',
        c.name as 'Name',
        c.age as 'Alter',
        c.youth_care_experience as 'Jugendhilfeerfahrung',
        c.fun_fact as 'Fun Fact',
        COUNT(v.id) as 'Stimmen'
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id
      ORDER BY COUNT(v.id) DESC, c.name ASC
    `);

    // Hole Statistiken
    const [statsResult] = await db.query(`
      SELECT
        COUNT(DISTINCT vote_session_id) as unique_voters,
        COUNT(*) as total_votes
      FROM votes
      WHERE vote_session_id IS NOT NULL
    `);

    const [subscriberStats] = await db.query(`
      SELECT
        COUNT(*) as total_subscribers,
        SUM(CASE WHEN has_voted = TRUE THEN 1 ELSE 0 END) as voted_subscribers
      FROM newsletter_subscriptions
      WHERE confirmed = TRUE
    `);

    // Erstelle Excel-Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Landesheimrat Wahl System';
    workbook.lastModifiedBy = 'Admin';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Hauptergebnisse-Sheet
    const resultsSheet = workbook.addWorksheet('Wahlergebnisse', {
      properties: { tabColor: { argb: 'FF1E88E5' } }
    });

    // Definiere Spalten
    resultsSheet.columns = [
      { header: 'Platz', key: 'Platz', width: 10 },
      { header: 'Name', key: 'Name', width: 30 },
      { header: 'Alter', key: 'Alter', width: 10 },
      { header: 'Einrichtung', key: 'Einrichtung', width: 35 },
      { header: 'Standort', key: 'Standort', width: 25 },
      { header: 'Stimmen', key: 'Stimmen', width: 12 }
    ];

    // Füge Daten hinzu
    resultsSheet.addRows(results);

    // Formatiere Header-Zeile
    resultsSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    resultsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' }
    };
    resultsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    resultsSheet.getRow(1).height = 25;

    // Formatiere die Top-3 Gewinner
    if (results.length > 0) {
      // Platz 1 - Gold
      resultsSheet.getRow(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF9C4' }
      };
      resultsSheet.getRow(2).font = { bold: true, size: 11 };
    }
    if (results.length > 1) {
      // Platz 2 - Silber
      resultsSheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      resultsSheet.getRow(3).font = { bold: true, size: 11 };
    }
    if (results.length > 2) {
      // Platz 3 - Bronze
      resultsSheet.getRow(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE0B2' }
      };
      resultsSheet.getRow(4).font = { bold: true, size: 11 };
    }

    // Füge Rahmen hinzu
    resultsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          right: { style: 'thin', color: { argb: 'FFB0B0B0' } }
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // Statistik-Sheet
    const statsSheet = workbook.addWorksheet('Statistiken', {
      properties: { tabColor: { argb: 'FF4CAF50' } }
    });

    statsSheet.columns = [
      { header: 'Metrik', key: 'metric', width: 40 },
      { header: 'Wert', key: 'value', width: 20 }
    ];

    const statisticsData = [
      { metric: 'Gesamtanzahl der abgegebenen Stimmen', value: statsResult[0].total_votes || 0 },
      { metric: 'Anzahl der Wohngruppen die gewählt haben', value: statsResult[0].unique_voters || 0 },
      { metric: 'Durchschnittliche Stimmen pro Wohngruppe', value: statsResult[0].unique_voters > 0 ? (statsResult[0].total_votes / statsResult[0].unique_voters).toFixed(1) : 0 },
      { metric: 'Registrierte Wohngruppen (Newsletter)', value: subscriberStats[0].total_subscribers || 0 },
      { metric: 'Wohngruppen die gewählt haben (Newsletter)', value: subscriberStats[0].voted_subscribers || 0 },
      { metric: 'Wahlbeteiligung (%)', value: subscriberStats[0].total_subscribers > 0 ? ((subscriberStats[0].voted_subscribers / subscriberStats[0].total_subscribers) * 100).toFixed(1) + '%' : '0%' }
    ];

    statsSheet.addRows(statisticsData);

    // Formatiere Statistik-Sheet
    statsSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    statsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
    statsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    statsSheet.getRow(1).height = 25;

    statsSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          left: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          bottom: { style: 'thin', color: { argb: 'FFB0B0B0' } },
          right: { style: 'thin', color: { argb: 'FFB0B0B0' } }
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // Generiere Excel-Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Sende Excel-Datei
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Wahlergebnisse_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting results:', error);
    res.status(500).json({ error: 'Fehler beim Exportieren der Ergebnisse' });
  }
};

// Get public voting results (all candidates)
const getPublicResults = async (req, res) => {
  try {
    // Alle Kandidaten mit Stimmzahlen
    const [results] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.age,
        c.youth_care_experience,
        c.fun_fact,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id
      ORDER BY vote_count DESC, c.name ASC
    `);

    // Gesamtzahl der Stimmen
    const [totalVotes] = await db.query('SELECT COUNT(*) as total FROM votes');

    // Anzahl der Wähler
    const [uniqueVoters] = await db.query('SELECT COUNT(DISTINCT vote_session_id) as count FROM votes WHERE vote_session_id IS NOT NULL');

    res.json({
      winners: results,
      statistics: {
        totalVotes: totalVotes[0].total,
        totalVoters: uniqueVoters[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching public results:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Ergebnisse' });
  }
};

module.exports = {
  submitVote,
  submitVoteWithEmail,
  verifyEmail,
  verifyToken,
  getResults,
  exportResults,
  getPublicResults,
};
