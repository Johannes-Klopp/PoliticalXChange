const db = require('../config/database');
const { sendVotingStartEmail, sendVotingReminderEmail } = require('../utils/email');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Send voting start email to all subscribers or specific one
const sendVotingStart = async (req, res) => {
  try {
    const { email } = req.body; // Optional: specific email
    const votingLink = FRONTEND_URL;

    let subscribers;
    if (email) {
      // Send to specific email
      [subscribers] = await db.query(
        'SELECT email, group_name, facility_name FROM newsletter_subscriptions WHERE email = ? AND confirmed = TRUE',
        [email]
      );
      if (subscribers.length === 0) {
        return res.status(404).json({ error: 'E-Mail nicht gefunden oder nicht bestätigt' });
      }
    } else {
      // Send to all confirmed subscribers
      [subscribers] = await db.query(
        'SELECT email, group_name, facility_name FROM newsletter_subscriptions WHERE confirmed = TRUE'
      );
    }

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Keine Empfänger gefunden' });
    }

    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const sub of subscribers) {
      const groupName = sub.group_name || sub.facility_name || 'Wohngruppe';
      const result = await sendVotingStartEmail(sub.email, groupName, votingLink);

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ email: sub.email, error: result.error });
      }
    }

    res.json({
      message: `Wahl-Start E-Mails versendet`,
      results
    });
  } catch (error) {
    console.error('Error sending voting start emails:', error);
    res.status(500).json({ error: 'Fehler beim Versenden der E-Mails' });
  }
};

// Send reminder email to subscribers who haven't voted yet
const sendVotingReminder = async (req, res) => {
  try {
    const { email } = req.body; // Optional: specific email
    const votingLink = FRONTEND_URL;

    let subscribers;
    if (email) {
      // Send to specific email (only if not voted)
      [subscribers] = await db.query(
        'SELECT email, group_name, facility_name FROM newsletter_subscriptions WHERE email = ? AND confirmed = TRUE AND (has_voted = FALSE OR has_voted IS NULL)',
        [email]
      );
      if (subscribers.length === 0) {
        return res.status(404).json({ error: 'E-Mail nicht gefunden, nicht bestätigt oder hat bereits abgestimmt' });
      }
    } else {
      // Send to all who haven't voted yet
      [subscribers] = await db.query(
        'SELECT email, group_name, facility_name FROM newsletter_subscriptions WHERE confirmed = TRUE AND (has_voted = FALSE OR has_voted IS NULL)'
      );
    }

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Keine Empfänger gefunden (alle haben bereits abgestimmt)' });
    }

    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const sub of subscribers) {
      const groupName = sub.group_name || sub.facility_name || 'Wohngruppe';
      const result = await sendVotingReminderEmail(sub.email, groupName, votingLink);

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ email: sub.email, error: result.error });
      }
    }

    res.json({
      message: `Erinnerungs-E-Mails versendet`,
      results
    });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    res.status(500).json({ error: 'Fehler beim Versenden der E-Mails' });
  }
};

// Get email statistics
const getEmailStats = async (req, res) => {
  try {
    const [totalSubs] = await db.query('SELECT COUNT(*) as count FROM newsletter_subscriptions WHERE confirmed = TRUE');
    const [votedSubs] = await db.query('SELECT COUNT(*) as count FROM newsletter_subscriptions WHERE confirmed = TRUE AND has_voted = TRUE');
    const [notVotedSubs] = await db.query('SELECT COUNT(*) as count FROM newsletter_subscriptions WHERE confirmed = TRUE AND (has_voted = FALSE OR has_voted IS NULL)');

    res.json({
      totalSubscribers: totalSubs[0].count,
      votedSubscribers: votedSubs[0].count,
      notVotedSubscribers: notVotedSubs[0].count
    });
  } catch (error) {
    console.error('Error getting email stats:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
};

module.exports = {
  sendVotingStart,
  sendVotingReminder,
  getEmailStats,
};
