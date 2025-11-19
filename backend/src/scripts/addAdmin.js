const bcrypt = require('bcryptjs');
const db = require('../config/database');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Script zum Hinzufügen eines neuen Admin-Accounts
 * 
 * Verwendung:
 * 1. Mit Umgebungsvariablen:
 *    ADMIN_EMAIL=neuer.admin@example.com ADMIN_PASSWORD=SicheresPasswort123! node src/scripts/addAdmin.js
 * 
 * 2. Mit Kommandozeilenargumenten:
 *    node src/scripts/addAdmin.js neuer.admin@example.com SicheresPasswort123!
 * 
 * 3. Mit automatisch generiertem sicheren Passwort:
 *    node src/scripts/addAdmin.js neuer.admin@example.com
 */

function generateSecurePassword(length = 24) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Mindestens ein Zeichen aus jeder Kategorie
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];
  
  // Rest mit zufälligen Zeichen auffüllen
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  // Passwort mischen
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
}

async function addAdmin() {
  try {
    console.log('🔧 Hinzufügen eines neuen Admin-Accounts...\n');

    // Benutzername und Passwort aus verschiedenen Quellen holen
    let username = process.env.ADMIN_EMAIL || process.argv[2];
    let password = process.env.ADMIN_PASSWORD || process.argv[3];
    
    if (!username) {
      console.error('❌ Fehler: Benutzername/E-Mail fehlt!');
      console.log('\nVerwendung:');
      console.log('  ADMIN_EMAIL=email@example.com ADMIN_PASSWORD=passwort node src/scripts/addAdmin.js');
      console.log('  oder');
      console.log('  node src/scripts/addAdmin.js email@example.com [passwort]');
      console.log('\nWenn kein Passwort angegeben wird, wird ein sicheres Passwort generiert.');
      process.exit(1);
    }

    // Generiere sicheres Passwort, falls keines angegeben wurde
    const passwordGenerated = !password;
    if (passwordGenerated) {
      password = generateSecurePassword();
      console.log('🔐 Sicheres Passwort wurde automatisch generiert.\n');
    }

    // Prüfe ob Admin bereits existiert
    const [existingAdmins] = await db.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (existingAdmins.length > 0) {
      console.error(`❌ Fehler: Admin mit Benutzername "${username}" existiert bereits!`);
      console.log('\nVerwenden Sie das updateAdmin.js Script, um einen bestehenden Admin zu aktualisieren.');
      process.exit(1);
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, 10);

    // Neuen Admin erstellen
    const [result] = await db.query(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    console.log('✅ Neuer Admin-Account erfolgreich erstellt!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 ADMIN-ZUGANGSDATEN');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   Benutzername: ${username}`);
    console.log(`   Passwort:     ${password}`);
    console.log(`   Admin-ID:     ${result.insertId}`);
    console.log('═══════════════════════════════════════════════════');
    
    if (passwordGenerated) {
      console.log('\n⚠️  WICHTIG: Speichern Sie dieses Passwort sicher!');
      console.log('   Es wird aus Sicherheitsgründen nicht erneut angezeigt.');
    }
    
    console.log('\n✨ Der Admin kann sich jetzt einloggen.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Admin-Accounts:', error.message);
    process.exit(1);
  }
}

addAdmin();
