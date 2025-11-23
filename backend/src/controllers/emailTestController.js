const { sendEmail, sendNewsletterNotification } = require('../utils/email');

// Send test email
exports.sendTestEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Gültige E-Mail-Adresse erforderlich' });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${subject || 'Test-Email'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0369a1;">Test-Email</h1>
  <p>${message || 'Dies ist eine Test-Email vom Landesheimrat-Wahl System.'}</p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;">✅ Email-System funktioniert!</p>
  </div>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="font-size: 12px; color: #666;">
    Gesendet: ${new Date().toLocaleString('de-DE')}
  </p>
</body>
</html>
    `;

    const textContent = `
Test-Email

${message || 'Dies ist eine Test-Email vom Landesheimrat-Wahl System.'}

Email-System funktioniert!

Gesendet: ${new Date().toLocaleString('de-DE')}
    `;

    const result = await sendEmail({
      to,
      subject: subject || 'Test-Email - Landesheimrat-Wahl',
      html: htmlContent,
      text: textContent
    });

    res.json({
      success: true,
      message: 'Test-Email wurde versendet',
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Fehler beim Versenden der Test-Email',
      details: error.message
    });
  }
};

// Send newsletter notification to all confirmed subscribers
exports.sendNewsletterToAll = async (req, res) => {
  try {
    const db = require('../config/database');

    // Get all confirmed subscribers
    const [subscribers] = await db.query(
      'SELECT email, group_name FROM newsletter_subscriptions WHERE confirmed = TRUE'
    );

    if (subscribers.length === 0) {
      return res.status(400).json({
        error: 'Keine bestätigten Newsletter-Abonnenten gefunden'
      });
    }

    const results = {
      total: subscribers.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send to all subscribers
    for (const subscriber of subscribers) {
      try {
        const votingLink = `${process.env.FRONTEND_URL}/vote?email=${encodeURIComponent(subscriber.email)}`;
        await sendNewsletterNotification(
          subscriber.email,
          subscriber.group_name,
          votingLink
        );
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Newsletter an ${results.sent} von ${results.total} Abonnenten versendet`,
      results
    });
  } catch (error) {
    console.error('Newsletter broadcast error:', error);
    res.status(500).json({
      error: 'Fehler beim Newsletter-Versand',
      details: error.message
    });
  }
};

// Get email sending status/stats
exports.getEmailStats = async (req, res) => {
  try {
    const hasApiKey = !!process.env.LETTERMINT_API_KEY;
    const fromEmail = process.env.LETTERMINT_FROM_EMAIL || 'noreply@send.lettermint.com';
    const fromName = process.env.LETTERMINT_FROM_NAME || 'Landesheimrat-Wahl';

    res.json({
      configured: hasApiKey,
      mode: hasApiKey ? 'production' : 'test',
      from: {
        email: fromEmail,
        name: fromName
      },
      apiKeyPresent: hasApiKey,
      provider: 'Lettermint'
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Email-Konfiguration' });
  }
};
