const db = require('../config/database');
const { sendNewsletterWelcomeEmail } = require('../utils/email');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email, groupName, facilityName, region } = req.body;

    // Validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Gültige E-Mail-Adresse erforderlich' });
    }

    if (!groupName || groupName.trim().length === 0) {
      return res.status(400).json({ error: 'Wohngruppenname erforderlich' });
    }

    if (!facilityName || facilityName.trim().length === 0) {
      return res.status(400).json({ error: 'Einrichtungsname erforderlich' });
    }

    // Check if already subscribed
    const [existing] = await db.query(
      'SELECT * FROM newsletter_subscriptions WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Diese E-Mail-Adresse ist bereits registriert' });
    }

    // Create subscription with group information - automatically confirmed
    await db.query(
      'INSERT INTO newsletter_subscriptions (email, group_name, facility_name, region, confirmed, confirmed_at) VALUES (?, ?, ?, ?, TRUE, NOW())',
      [email, groupName.trim(), facilityName.trim(), region?.trim() || null]
    );

    // Send welcome/confirmation email (not a confirmation link, just info)
    // Don't await - send in background to avoid blocking the response
    sendNewsletterWelcomeEmail(email, groupName.trim()).catch(err => {
      console.error('Failed to send welcome email:', err.message);
    });

    res.json({ message: 'Vielen Dank für Ihre Anmeldung!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Fehler beim Anmelden' });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    await db.query(
      'DELETE FROM newsletter_subscriptions WHERE email = ?',
      [email]
    );

    res.json({ message: 'Erfolgreich abgemeldet' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Fehler beim Abmelden' });
  }
};

// Get all subscribers (admin only)
exports.getSubscribers = async (req, res) => {
  try {
    const [subscribers] = await db.query(
      'SELECT id, email, group_name, facility_name, region, confirmed, created_at FROM newsletter_subscriptions ORDER BY created_at DESC'
    );

    res.json({ subscribers });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Abonnenten' });
  }
};

// Delete subscriber (admin only)
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'DELETE FROM newsletter_subscriptions WHERE id = ?',
      [id]
    );

    res.json({ message: 'Anmeldung erfolgreich gelöscht' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
};
