const nodemailer = require('nodemailer');
require('dotenv').config();

// Email sending via Lettermint SMTP
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Test mode: Log email instead of sending (wenn keine API-Key vorhanden)
    if (!process.env.LETTERMINT_API_KEY) {
      console.log('📧 [TEST MODE] Email would be sent:');
      console.log('   To:', to);
      console.log('   Subject:', subject);
      console.log('   Text preview:', text.substring(0, 100) + '...');
      return { success: true, messageId: 'test-mode-' + Date.now() };
    }

    // Production: Lettermint SMTP
    const fromEmail = process.env.LETTERMINT_FROM_EMAIL || 'noreply@landesheimrat-wahl.de';
    const fromName = process.env.LETTERMINT_FROM_NAME || 'Landesheimrat-Wahl';

    console.log('📧 Sending email via Lettermint SMTP to:', to);

    // Lettermint SMTP Configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.lettermint.co',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: 'lettermint',
        pass: process.env.LETTERMINT_API_KEY,
      },
    });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
      headers: {
        'X-LM-Tag': 'landesheimrat-wahl',
      }
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully via Lettermint SMTP:', {
      to,
      subject,
      messageId: info.messageId,
      response: info.response
    });

    return { success: true, messageId: info.messageId, info };

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    // Im Development-Mode trotzdem weitermachen
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Development mode: Continuing despite email error');
      return { success: false, error: error.message };
    }
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

// Send newsletter welcome email (automatic confirmation)
const sendNewsletterWelcomeEmail = async (email, groupName) => {
  const subject = 'Newsletter-Anmeldung bestätigt - Landesheimrat-Wahl';
  const text = `
Hallo ${groupName},

hiermit bestätigen wir Ihre Anmeldung für Updates zur Landesheimrat-Wahl.

Sie erhalten in Kürze weitere Informationen zur Wahl, einschließlich:
- Eine Erinnerung vor Beginn der Wahl
- Wichtige Updates zum Wahlablauf
- Informationen zu den Kandidaten

Bei Fragen wenden Sie sich bitte an das Hessische Ministerium für Arbeit, Integration, Jugend und Soziales.

Mit freundlichen Grüßen
Das Landesheimrat-Wahl Team
  `;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Newsletter-Anmeldung bestätigt</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0369a1;">Anmeldung bestätigt</h1>
  <p>Hallo <strong>${groupName}</strong>,</p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;">Hiermit bestätigen wir Ihre Anmeldung für Updates zur Landesheimrat-Wahl.</p>
  </div>

  <h3 style="color: #0369a1;">Was Sie erwartet:</h3>
  <ul>
    <li>Eine <strong>Erinnerung</strong> vor Beginn der Wahl</li>
    <li><strong>Wichtige Updates</strong> zum Wahlablauf</li>
    <li><strong>Informationen</strong> zu den Kandidaten</li>
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

// Send newsletter notification to registered groups
const sendNewsletterNotification = async (email, groupName, votingLink) => {
  const subject = 'Die Landesheimrat-Wahl hat begonnen!';
  const text = `
Hallo ${groupName},

die Wahl zum Landesheimrat hat begonnen. Sie können jetzt Ihre Stimme abgeben.

Ihr persönlicher Wahl-Link:
${votingLink}

Wichtige Hinweise:
- Sie können bis zu 8 Kandidaten wählen
- Dieser Link kann nur einmal verwendet werden
- Die Wahl ist anonym
- Der Link ist gültig bis zum Ende der Wahlperiode

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
  <h1 style="color: #0369a1;">Die Wahl hat begonnen!</h1>
  <p>Hallo <strong>${groupName}</strong>,</p>
  <p>die Wahl zum Landesheimrat hat begonnen. Sie können jetzt Ihre Stimme abgeben.</p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Ihr persönlicher Wahl-Link:</strong></p>
    <p style="margin: 10px 0;">
      <a href="${votingLink}" style="color: #0369a1; text-decoration: none; font-weight: bold;">${votingLink}</a>
    </p>
  </div>

  <h3 style="color: #0369a1;">Wichtige Hinweise:</h3>
  <ul>
    <li>Sie können bis zu <strong>8 Kandidaten</strong> wählen</li>
    <li>Dieser Link kann nur <strong>einmal</strong> verwendet werden</li>
    <li>Die Wahl ist <strong>anonym</strong></li>
    <li>Der Link ist gültig bis zum <strong>Ende der Wahlperiode</strong></li>
  </ul>

  <p>Bei Fragen wenden Sie sich bitte an das Hessische Ministerium für Arbeit, Integration, Jugend und Soziales.</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="font-size: 12px; color: #666;">
    Diese E-Mail wurde im Auftrag des Hessischen Ministeriums für Arbeit, Integration, Jugend und Soziales versendet.
  </p>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendVotingTokenEmail,
  sendNewsletterWelcomeEmail,
  sendNewsletterNotification,
};
