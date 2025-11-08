const db = require('../config/database');
const { sendNewsletterConfirmation } = require('../utils/email');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Gültige E-Mail-Adresse erforderlich' });
    }

    // Check if already subscribed
    const [existing] = await db.query(
      'SELECT * FROM newsletter_subscriptions WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      if (existing[0].confirmed) {
        return res.status(400).json({ error: 'Diese E-Mail-Adresse ist bereits registriert' });
      } else {
        // Resend confirmation
        await sendNewsletterConfirmation(email);
        return res.json({ message: 'Bestätigungs-E-Mail erneut gesendet' });
      }
    }

    // Create subscription
    await db.query(
      'INSERT INTO newsletter_subscriptions (email) VALUES (?)',
      [email]
    );

    // Send confirmation email
    await sendNewsletterConfirmation(email);

    res.json({ message: 'Vielen Dank! Bitte bestätigen Sie Ihre E-Mail-Adresse.' });
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
      'SELECT id, email, confirmed, subscribed_at FROM newsletter_subscriptions ORDER BY subscribed_at DESC'
    );

    res.json({ subscribers });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Abonnenten' });
  }
};
