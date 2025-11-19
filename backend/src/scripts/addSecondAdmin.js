require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/**
 * Fügt einen zweiten Admin-User direkt zur Railway-Datenbank hinzu
 * 
 * Verwendung:
 * node src/scripts/addSecondAdmin.js
 */

async function addSecondAdmin() {
    console.log('🔧 Hinzufügen eines zweiten Admin-Accounts...\n');

    // Zweiter Admin: username und password
    const username = 'admin';
    const password = 'ChangeMeNow123!';

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }

    const connection = await mysql.createConnection(dbUrl);

    try {
        // Prüfe ob Admin bereits existiert
        const [existing] = await connection.query(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            console.log(`ℹ️  Admin "${username}" existiert bereits!`);
            console.log(`   Möchtest du das Passwort aktualisieren? Dann nutze updateAdmin.js\n`);
            process.exit(0);
        }

        // Passwort hashen
        const passwordHash = await bcrypt.hash(password, 10);

        // Neuen Admin erstellen
        const [result] = await connection.query(
            'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
            [username, passwordHash]
        );

        console.log('✅ Zweiter Admin-Account erfolgreich erstellt!\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('📋 ADMIN-ZUGANGSDATEN');
        console.log('═══════════════════════════════════════════════════');
        console.log(`   Benutzername: ${username}`);
        console.log(`   Passwort:     ${password}`);
        console.log(`   Admin-ID:     ${result.insertId}`);
        console.log('═══════════════════════════════════════════════════');
        console.log('\n⚠️  WICHTIG: Ändere dieses Passwort nach dem ersten Login!');
        console.log('✨ Der Admin kann sich jetzt einloggen.\n');

    } catch (error) {
        console.error('❌ Fehler:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

addSecondAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
