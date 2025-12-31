const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

// Email sending via Lettermint API
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

    // Production: Lettermint API
    const fromEmail = process.env.LETTERMINT_FROM_EMAIL || 'noreply@politicalxchange.com';
    const fromName = process.env.LETTERMINT_FROM_NAME || 'Landesheimrat-Wahl';
    const apiKey = process.env.LETTERMINT_API_KEY;

    console.log('📧 Sending email via Lettermint API to:', to);
    console.log('   API Key present:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
    console.log('   API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');

    const requestBody = {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
      text: text
    };

    console.log('   Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.lettermint.co/v1/send', {
      method: 'POST',
      headers: {
        'x-lettermint-token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Lettermint API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    console.log('✅ Email sent successfully via Lettermint API:', {
      to,
      subject,
      messageId: data.id
    });

    return { success: true, messageId: data.id, data };

  } catch (error) {
    console.error('❌ Email sending failed:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    // Im Development-Mode UND Production trotzdem weitermachen (nicht blockieren)
    console.log('⚠️  Continuing despite email error (non-blocking)');
    return { success: false, error: error.message };
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

// Send voting start notification
const sendVotingStartEmail = async (email, groupName, votingLink) => {
  const subject = 'Die Landesheimrat-Wahl hat begonnen - Jetzt abstimmen!';
  const text = `
Hallo ${groupName},

die Wahl zum Landesheimrat hat begonnen! Sie können jetzt Ihre Stimme abgeben.

Klicken Sie hier, um zur Wahl zu gelangen:
${votingLink}

Wichtige Hinweise:
- Pro Wohngruppe können 8 Stimmen abgegeben werden
- Die Wahl ist anonym
- Melden Sie sich mit der gleichen E-Mail-Adresse an, mit der Sie sich für den Newsletter registriert haben

Bei Fragen wenden Sie sich bitte an das Wahlteam.

Mit freundlichen Grüßen
Das Landesheimrat-Wahl Team
  `;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Die Wahl hat begonnen!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Die Wahl hat begonnen!</h1>
  </div>

  <p>Hallo <strong>${groupName}</strong>,</p>
  <p>die Wahl zum Landesheimrat hat begonnen! Sie können jetzt Ihre Stimme abgeben.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${votingLink}" style="background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
      Jetzt abstimmen
    </a>
  </div>

  <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0;">
    <h3 style="color: #0369a1; margin-top: 0;">Wichtige Hinweise:</h3>
    <ul style="margin-bottom: 0;">
      <li>Pro Wohngruppe können <strong>8 Stimmen</strong> abgegeben werden</li>
      <li>Die Wahl ist <strong>anonym</strong></li>
      <li>Melden Sie sich mit der <strong>gleichen E-Mail-Adresse</strong> an, mit der Sie sich für den Newsletter registriert haben</li>
    </ul>
  </div>

  <p>Bei Fragen wenden Sie sich bitte an das Wahlteam.</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="font-size: 12px; color: #666;">
    Diese E-Mail wurde im Auftrag des Landesheimrats versendet.<br>
    Political XChange i.G. | Eichenweg 2 | 35452 Heuchelheim
  </p>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

// Send voting reminder email
const sendVotingReminderEmail = async (email, groupName, votingLink) => {
  const subject = 'LETZTER TAG: Heute noch abstimmen! - Landesheimrat-Wahl';
  const text = `
Hallo ${groupName},

Sie haben noch nicht an der Landesheimrat-Wahl teilgenommen.

ACHTUNG: HEUTE ist der LETZTE TAG der Wahl! Stimmen Sie jetzt ab!

Klicken Sie hier, um zur Wahl zu gelangen:
${votingLink}

Wichtige Hinweise:
- HEUTE (31.12.2025) ist der letzte Tag der Wahl!
- Pro Wohngruppe können 8 Stimmen abgegeben werden
- Die Wahl ist anonym
- Melden Sie sich mit der gleichen E-Mail-Adresse an, mit der Sie sich für den Newsletter registriert haben

Bei Fragen wenden Sie sich bitte an das Wahlteam.

Mit freundlichen Grüßen
Das Landesheimrat-Wahl Team
  `;

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LETZTER TAG der Wahl!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚨 LETZTER TAG: Heute noch abstimmen!</h1>
  </div>

  <p>Hallo <strong>${groupName}</strong>,</p>
  <p>Sie haben noch nicht an der Landesheimrat-Wahl teilgenommen.</p>
  <p style="font-size: 20px; color: #dc2626; font-weight: bold;">⚠️ HEUTE ist der LETZTE TAG der Wahl! Stimmen Sie jetzt ab!</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${votingLink}" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
      Jetzt abstimmen
    </a>
  </div>

  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
    <h3 style="color: #dc2626; margin-top: 0;">Wichtige Hinweise:</h3>
    <ul style="margin-bottom: 0;">
      <li><strong>HEUTE (31.12.2025) ist der letzte Tag der Wahl!</strong></li>
      <li>Pro Wohngruppe können <strong>8 Stimmen</strong> abgegeben werden</li>
      <li>Die Wahl ist <strong>anonym</strong></li>
      <li>Melden Sie sich mit der <strong>gleichen E-Mail-Adresse</strong> an, mit der Sie sich für den Newsletter registriert haben</li>
    </ul>
  </div>

  <p>Bei Fragen wenden Sie sich bitte an das Wahlteam.</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="font-size: 12px; color: #666;">
    Diese E-Mail wurde im Auftrag des Landesheimrats versendet.<br>
    Political XChange i.G. | Eichenweg 2 | 35452 Heuchelheim
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
  sendVotingStartEmail,
  sendVotingReminderEmail,
};
