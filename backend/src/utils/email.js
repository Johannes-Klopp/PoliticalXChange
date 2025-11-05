const nodemailer = require('nodemailer');
require('dotenv').config();

// Lettermint SMTP Configuration
// Hinweis: Lettermint API-Details müssen angepasst werden
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Für lokale Entwicklung: Ethereal Email (fake SMTP)
    if (process.env.NODE_ENV === 'development' && !process.env.LETTERMINT_API_KEY) {
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.LETTERMINT_FROM_NAME}" <${process.env.LETTERMINT_FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('📧 Test Email sent:', nodemailer.getTestMessageUrl(info));
      return { success: true, messageId: info.messageId };
    }

    // Production: Lettermint API
    // TODO: Implementiere Lettermint API Integration
    // Dokumentation: https://lettermint.com/docs

    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://api.lettermint.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LETTERMINT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: process.env.LETTERMINT_FROM_EMAIL,
          name: process.env.LETTERMINT_FROM_NAME,
        },
        to: [{ email: to }],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lettermint API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📧 Email sent via Lettermint:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Send voting token email
const sendVotingTokenEmail = async (email, facilityName, votingLink) => {
  const subject = 'Ihr Zugang zur Landesheimrat-Wahl';
  const text = `
Sehr geehrte Damen und Herren von ${facilityName},

Sie erhalten diesen Link, um an der Wahl des Landesheimrats teilzunehmen.

Ihr persönlicher Wahl-Link:
${votingLink}

Wichtige Hinweise:
- Dieser Link kann nur einmal verwendet werden
- Die Wahl ist anonym
- Jede Einrichtung kann eine Stimme abgeben
- Der Link ist gültig bis zum 30. November 2025

Bei Fragen wenden Sie sich bitte an das Hessische Ministerium für Arbeit, Integration, Jugend und Soziales.

Mit freundlichen Grüßen
Das Landesheimrat-Wahl Team
  `;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landesheimrat-Wahl</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0369a1;">Landesheimrat-Wahl</h1>
  <p>Sehr geehrte Damen und Herren von <strong>${facilityName}</strong>,</p>
  <p>Sie erhalten diesen Link, um an der Wahl des Landesheimrats teilzunehmen.</p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Ihr persönlicher Wahl-Link:</strong></p>
    <p style="margin: 10px 0;">
      <a href="${votingLink}" style="color: #0369a1; text-decoration: none; font-weight: bold;">${votingLink}</a>
    </p>
  </div>

  <h3 style="color: #0369a1;">Wichtige Hinweise:</h3>
  <ul>
    <li>Dieser Link kann nur <strong>einmal</strong> verwendet werden</li>
    <li>Die Wahl ist <strong>anonym</strong></li>
    <li>Jede Einrichtung kann <strong>eine Stimme</strong> abgeben</li>
    <li>Der Link ist gültig bis zum <strong>30. November 2025</strong></li>
  </ul>

  <p>Bei Fragen wenden Sie sich bitte an das Hessische Ministerium für Arbeit, Integration, Jugend und Soziales.</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="font-size: 12px; color: #666;">
    Diese E-Mail wurde im Auftrag des Hessischen Ministeriums für Arbeit, Integration, Jugend und Soziales versendet.<br>
    Political XChange i.G. | Eichenweg 2 | 35452 Heuchelheim
  </p>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

// Send newsletter confirmation email
const sendNewsletterConfirmationEmail = async (email, confirmationLink) => {
  const subject = 'Newsletter-Anmeldung bestätigen';
  const text = `
Bitte bestätigen Sie Ihre Newsletter-Anmeldung für Updates zur Landesheimrat-Wahl.

Bestätigungslink:
${confirmationLink}

Falls Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail bitte.
  `;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Newsletter-Anmeldung bestätigen</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0369a1;">Newsletter-Anmeldung bestätigen</h1>
  <p>Bitte bestätigen Sie Ihre Newsletter-Anmeldung für Updates zur Landesheimrat-Wahl.</p>

  <p style="margin: 30px 0;">
    <a href="${confirmationLink}" style="background-color: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Anmeldung bestätigen
    </a>
  </p>

  <p style="font-size: 14px; color: #666;">
    Falls Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail bitte.
  </p>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendVotingTokenEmail,
  sendNewsletterConfirmationEmail,
};
