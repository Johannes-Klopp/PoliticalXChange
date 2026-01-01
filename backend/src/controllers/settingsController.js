const db = require('../config/database');

// Get election status
const getElectionStatus = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'election_closed'"
    );

    const isClosed = rows.length > 0 && rows[0].setting_value === 'true';
    res.json({ electionClosed: isClosed });
  } catch (error) {
    console.error('Error getting election status:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Wahlstatus' });
  }
};

// Set election status (Admin only)
const setElectionStatus = async (req, res) => {
  try {
    const { closed } = req.body;

    await db.query(
      "UPDATE settings SET setting_value = ? WHERE setting_key = 'election_closed'",
      [closed ? 'true' : 'false']
    );

    res.json({
      message: closed ? 'Wahl wurde geschlossen' : 'Wahl wurde geöffnet',
      electionClosed: closed
    });
  } catch (error) {
    console.error('Error setting election status:', error);
    res.status(500).json({ error: 'Fehler beim Ändern des Wahlstatus' });
  }
};

module.exports = {
  getElectionStatus,
  setElectionStatus,
};
