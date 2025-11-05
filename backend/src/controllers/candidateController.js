const db = require('../config/database');

// Get all candidates
const getAllCandidates = async (req, res) => {
  try {
    const [candidates] = await db.query(
      'SELECT id, name, age, facility_name, facility_location, biography FROM candidates ORDER BY name ASC'
    );

    res.json({ candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Kandidaten' });
  }
};

// Get single candidate
const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const [candidates] = await db.query(
      'SELECT id, name, age, facility_name, facility_location, biography FROM candidates WHERE id = ?',
      [id]
    );

    if (candidates.length === 0) {
      return res.status(404).json({ error: 'Kandidat nicht gefunden' });
    }

    res.json({ candidate: candidates[0] });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Kandidaten' });
  }
};

// Create candidate (Admin only)
const createCandidate = async (req, res) => {
  try {
    const { name, age, facility_name, facility_location, biography } = req.body;

    // Validation
    if (!name || !facility_name || !facility_location) {
      return res.status(400).json({
        error: 'Name, Einrichtungsname und Standort sind erforderlich'
      });
    }

    if (biography && biography.length > 2000) {
      return res.status(400).json({
        error: 'Biografie darf maximal 2000 Zeichen lang sein'
      });
    }

    const [result] = await db.query(
      'INSERT INTO candidates (name, age, facility_name, facility_location, biography) VALUES (?, ?, ?, ?, ?)',
      [name, age || null, facility_name, facility_location, biography || null]
    );

    res.status(201).json({
      message: 'Kandidat erfolgreich erstellt',
      candidateId: result.insertId
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Kandidaten' });
  }
};

// Update candidate (Admin only)
const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, facility_name, facility_location, biography } = req.body;

    if (biography && biography.length > 2000) {
      return res.status(400).json({
        error: 'Biografie darf maximal 2000 Zeichen lang sein'
      });
    }

    const [result] = await db.query(
      'UPDATE candidates SET name = ?, age = ?, facility_name = ?, facility_location = ?, biography = ? WHERE id = ?',
      [name, age || null, facility_name, facility_location, biography || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandidat nicht gefunden' });
    }

    res.json({ message: 'Kandidat erfolgreich aktualisiert' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Kandidaten' });
  }
};

// Delete candidate (Admin only)
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM candidates WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Kandidat nicht gefunden' });
    }

    res.json({ message: 'Kandidat erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Kandidaten' });
  }
};

// Bulk upload candidates (Admin only)
const bulkUploadCandidates = async (req, res) => {
  try {
    const { candidates } = req.body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Ungültige Kandidatenliste' });
    }

    const values = candidates.map(c => [
      c.name,
      c.age || null,
      c.facility_name,
      c.facility_location,
      c.biography || null
    ]);

    const [result] = await db.query(
      'INSERT INTO candidates (name, age, facility_name, facility_location, biography) VALUES ?',
      [values]
    );

    res.status(201).json({
      message: `${result.affectedRows} Kandidaten erfolgreich hochgeladen`
    });
  } catch (error) {
    console.error('Error bulk uploading candidates:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen der Kandidaten' });
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  bulkUploadCandidates,
};
