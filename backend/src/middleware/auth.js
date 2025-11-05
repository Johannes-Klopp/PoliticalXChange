const jwt = require('jsonwebtoken');

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Kein Token bereitgestellt' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
};

// Verify Admin Role
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Zugriff verweigert. Admin-Rechte erforderlich.' });
  }
  next();
};

// Verify Voting Token (one-time use)
const verifyVotingToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Kein Voting-Token bereitgestellt' });
  }

  try {
    const db = require('../config/database');

    // Check if token exists and is not used
    const [rows] = await db.query(
      'SELECT * FROM voting_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Ungültiger oder bereits verwendeter Token' });
    }

    req.votingToken = rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Token-Verifizierung fehlgeschlagen' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyVotingToken
};
