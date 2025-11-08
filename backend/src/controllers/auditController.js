const db = require('../config/database');

// Get audit logs (admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const [logs] = await db.query(
      `SELECT 
        id, 
        action, 
        table_name, 
        record_id, 
        user_id, 
        ip_address, 
        user_agent, 
        created_at 
      FROM audit_log 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM audit_log');

    res.json({ logs, total });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Audit-Logs' });
  }
};
