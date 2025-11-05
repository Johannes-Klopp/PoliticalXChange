# 🚀 Quick Start Guide

Schnellstart für lokale Entwicklung.

## Voraussetzungen installiert?

- ✅ Node.js 18+ (`node --version`)
- ✅ MySQL 8+ (`mysql --version`)
- ✅ npm (`npm --version`)

## Los geht's! (5 Minuten)

### 1. Datenbank erstellen

```bash
# MySQL starten (macOS mit Homebrew)
brew services start mysql

# Oder manuell
mysql.server start

# Datenbank erstellen
mysql -u root -p < backend/database.sql
```

**Wichtig**: Merke dir das MySQL root Passwort!

### 2. Backend starten

```bash
cd backend

# Dependencies installieren
npm install

# .env anpassen (MySQL Passwort eintragen)
nano .env  # oder code .env

# Server starten
npm run dev
```

✅ **Backend läuft auf**: http://localhost:3000

### 3. Frontend starten (Neues Terminal-Fenster)

```bash
cd frontend

# Dependencies installieren
npm install

# Server starten
npm run dev
```

✅ **Frontend läuft auf**: http://localhost:5173

## 🎯 Erste Schritte

### Admin-Login

1. Öffne: http://localhost:5173/admin/login
2. Login:
   - **Username**: `admin`
   - **Password**: `ChangeMeNow123!`

### Test-Kandidaten anlegen

1. Im Admin-Dashboard → Tab "Kandidaten"
2. Füge einen Kandidaten hinzu:
   - Name: Max Mustermann
   - Alter: 16
   - Einrichtung: Beispiel Jugendhilfe
   - Standort: Frankfurt
   - Biografie: "Ich möchte mich für..."

### Test-Einrichtung & Wahl testen

1. Tab "Einrichtungen"
2. Füge deine E-Mail hinzu
3. **Prüfe Posteingang** (oder Terminal-Output für Test-Link)
4. Klicke auf Voting-Link
5. Wähle Kandidat und gib Stimme ab
6. Prüfe Ergebnisse im Admin-Panel

## ⚠️ Häufige Probleme

### Backend startet nicht

**Problem**: `Error: connect ECONNREFUSED`

**Lösung**:
```bash
# MySQL läuft?
brew services list

# MySQL starten
brew services start mysql

# Password in backend/.env korrekt?
```

### Frontend kann Backend nicht erreichen

**Problem**: `Network Error` in Browser Console

**Lösung**:
```bash
# Backend läuft auf Port 3000?
curl http://localhost:3000/health

# Falls nicht, backend neu starten:
cd backend && npm run dev
```

### E-Mails kommen nicht an

**Entwicklung**: E-Mails gehen an Ethereal (Fake SMTP)

**Link im Terminal**:
```
📧 Test Email sent: https://ethereal.email/message/...
```

Klicke auf den Link um E-Mail zu sehen!

## 🛠️ Entwickler-Tipps

### Datenbank zurücksetzen

```bash
mysql -u root -p

DROP DATABASE landesheimrat_wahl;
CREATE DATABASE landesheimrat_wahl;
exit;

mysql -u root -p < backend/database.sql
```

### Alle Test-Daten löschen

```bash
mysql -u root -p landesheimrat_wahl

DELETE FROM votes;
DELETE FROM voting_tokens;
DELETE FROM facilities;
DELETE FROM candidates;
DELETE FROM audit_log;
```

### Backend API testen

```bash
# Health Check
curl http://localhost:3000/health

# Kandidaten abrufen
curl http://localhost:3000/api/candidates

# Mit jq (schöner formatiert)
curl http://localhost:3000/api/candidates | jq
```

### Hot Reload

Beide Server (Frontend + Backend) haben Hot Reload:
- Ändere Code → speichern → automatisch neu geladen!

## 📚 Nächste Schritte

- [ ] Alle Seiten im Browser testen
- [ ] Admin-Panel erkunden
- [ ] Test-Wahl durchführen
- [ ] README.md lesen
- [ ] Bei Deployment: DEPLOYMENT.md lesen

## 🆘 Hilfe benötigt?

1. Prüfe Terminal-Output auf Fehler
2. Browser Console öffnen (F12)
3. Schaue in `backend/src/server.js` für Logs
4. Lies DEPLOYMENT.md für Production-Setup

Viel Erfolg! 🎉
