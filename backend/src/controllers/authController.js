const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
    }

    const [admins] = await db.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login erfolgreich',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Fehler bei der Anmeldung' });
  }
};

// Change admin password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Aktuelles und neues Passwort erforderlich'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Neues Passwort muss mindestens 8 Zeichen lang sein'
      });
    }

    const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [adminId]);

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin nicht gefunden' });
    }

    const validPassword = await bcrypt.compare(currentPassword, admins[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE admins SET password_hash = ? WHERE id = ?',
      [hashedPassword, adminId]
    );

    res.json({ message: 'Passwort erfolgreich geändert' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Fehler beim Ändern des Passworts' });
  }
};

module.exports = {
  adminLogin,
  changePassword,
};
