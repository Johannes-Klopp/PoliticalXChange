# Deployment-Anleitung

Schritt-für-Schritt Anleitung zum Deployment der Landesheimrat-Wahl Platform.

## 📋 Voraussetzungen

- Fertig entwickelte Anwendung (lokal getestet)
- Zugang zu einem Server/Hosting-Provider
- Accounts bei folgenden Services:
  - **Scaling React** (Backend Serverless Hosting)
  - **Scalingo** (MySQL Managed Database)
  - **Lettermint** (E-Mail-Versand)
  - **Netlify/Vercel** (Frontend Static Hosting) - Optional

## 🗄️ Schritt 1: MySQL Datenbank aufsetzen (Scalingo)

### 1.1 Account erstellen

1. Gehe zu [scalingo.com](https://scalingo.com)
2. Erstelle einen Account
3. Wähle die EU-Region (Paris oder Amsterdam)

### 1.2 MySQL Addon hinzufügen

1. Erstelle eine neue App: "landesheimrat-wahl-db"
2. Gehe zu "Addons" → "MySQL"
3. Wähle den passenden Plan (Starter 512MB reicht für Entwicklung)
4. Bestätige die Erstellung

### 1.3 Datenbank initialisieren

1. Kopiere die Connection URL aus dem Dashboard
2. Verbinde dich via MySQL Client:

```bash
# Connection String hat das Format:
# mysql://user:password@host:port/database

mysql -h <host> -P <port> -u <user> -p <database>
```

3. Führe das SQL-Script aus:

```bash
mysql -h <host> -P <port> -u <user> -p <database> < backend/database.sql
```

4. Notiere die Connection-Details für später:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

## 📧 Schritt 2: E-Mail-Service (Lettermint)

### 2.1 Account erstellen

1. Gehe zu [lettermint.com](https://lettermint.com)
2. Erstelle einen Account
3. Verifiziere deine Domain (oder nutze deren Subdomain)

### 2.2 API-Key generieren

1. Gehe zu "Settings" → "API Keys"
2. Erstelle einen neuen API Key
3. Notiere den Key (wird nur einmal angezeigt!)

### 2.3 E-Mail Templates (Optional)

Lettermint unterstützt Templates. Du kannst:
- Die Standard-HTML-E-Mails aus `backend/src/utils/email.js` nutzen
- Oder eigene Templates in Lettermint erstellen

**Wichtig**: Notiere für später:
- `LETTERMINT_API_KEY`
- `LETTERMINT_FROM_EMAIL`

## 🚀 Schritt 3: Backend deployen (Scaling React)

### 3.1 Account erstellen

1. Gehe zu [scaling-react.com](https://scaling-react.com)
2. Erstelle einen Account
3. Verifiziere E-Mail-Adresse

### 3.2 Projekt vorbereiten

1. Im `backend/` Ordner:

```bash
cd backend

# Stelle sicher, dass alle Dependencies installiert sind
npm install

# Erstelle Production Build (falls nötig)
npm run build
```

### 3.3 Projekt deployen

**Option A: CLI Deployment**

```bash
# Scaling React CLI installieren
npm install -g @scaling-react/cli

# Login
scaling-react login

# Projekt deployen
scaling-react deploy
```

**Option B: Git Deployment**

1. Erstelle ein Git Repository (falls noch nicht vorhanden)
2. Verbinde mit Scaling React:

```bash
git remote add scaling-react <your-scaling-react-git-url>
git push scaling-react main
```

### 3.4 Umgebungsvariablen setzen

Im Scaling React Dashboard → Settings → Environment Variables:

```env
# Database (von Scalingo)
DB_HOST=<scalingo-host>
DB_USER=<scalingo-user>
DB_PASSWORD=<scalingo-password>
DB_NAME=<scalingo-database>

# JWT
JWT_SECRET=<generiere-ein-sicheres-secret>  # z.B. mit: openssl rand -hex 32

# Email (Lettermint)
LETTERMINT_API_KEY=<dein-lettermint-api-key>
LETTERMINT_FROM_EMAIL=noreply@landesheimrat-wahl.de
LETTERMINT_FROM_NAME=Landesheimrat Wahl

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://<deine-frontend-url>

# Election Settings
ELECTION_START_DATE=2025-11-22T00:00:00Z
ELECTION_END_DATE=2025-11-30T23:59:59Z
```

**JWT Secret generieren:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.5 Deployment testen

1. Notiere die Backend-URL (z.B. `https://landesheimrat-wahl.scaling-react.app`)
2. Teste Health Endpoint:

```bash
curl https://<deine-backend-url>/health
```

Sollte zurückgeben:
```json
{"status":"ok","timestamp":"2025-11-05T..."}
```

## 🎨 Schritt 4: Frontend deployen

### 4.1 Build vorbereiten

1. Im `frontend/` Ordner:

```bash
cd frontend

# .env anpassen
echo "VITE_API_URL=https://<deine-backend-url>/api" > .env

# Production Build erstellen
npm run build
```

Dies erstellt einen `dist/` Ordner mit den statischen Dateien.

### 4.2 Deployment (Netlify)

**Option A: Drag & Drop**

1. Gehe zu [netlify.com](https://netlify.com)
2. Erstelle einen Account
3. Ziehe den `dist/` Ordner ins Dashboard
4. Fertig!

**Option B: CLI**

```bash
npm install -g netlify-cli

netlify login
netlify deploy --prod --dir=dist
```

### 4.3 Deployment (Vercel)

```bash
npm install -g vercel

vercel login
vercel --prod
```

### 4.4 Custom Domain (Optional)

1. Im Netlify/Vercel Dashboard → Domain Settings
2. Füge deine Domain hinzu (z.B. `wahl.landesheimrat.de`)
3. Konfiguriere DNS-Records wie angegeben
4. SSL-Zertifikat wird automatisch erstellt

## 🔒 Schritt 5: AV-Verträge abschließen

**DSGVO-Konformität erfordert Auftragsverarbeitungsverträge (AV-Verträge) mit allen Drittanbietern:**

### 5.1 Scaling React

- Kontakt: [support@scaling-react.com]
- Template: Auf Website verfügbar unter "Legal" → "Data Processing Agreement"

### 5.2 Scalingo

- Kontakt: [support@scalingo.com]
- Template: [scalingo.com/legal/dpa]

### 5.3 Lettermint

- Kontakt: [legal@lettermint.com]
- Template: Im Dashboard unter "Legal" → "DPA"

**Alle Verträge:**
- Ausfüllen mit Daten von Political XChange i.G.
- Unterschreiben
- Archivieren (für DSGVO-Nachweis)

## ⚙️ Schritt 6: Admin-Account einrichten

### 6.1 Erstes Login

1. Gehe zu `https://<deine-frontend-url>/admin/login`
2. Login mit:
   - Benutzername: `admin`
   - Passwort: `ChangeMeNow123!`

### 6.2 Passwort ändern

1. Im Admin-Dashboard → Einstellungen
2. Ändere das Passwort sofort!
3. Wähle ein sicheres Passwort (min. 12 Zeichen)

## 📊 Schritt 7: Test-Durchlauf

### 7.1 Kandidaten hinzufügen

1. Login als Admin
2. Gehe zu "Kandidaten" Tab
3. Füge 2-3 Test-Kandidaten hinzu

### 7.2 Einrichtung hinzufügen

1. Gehe zu "Einrichtungen" Tab
2. Füge eine Test-Einrichtung mit deiner E-Mail hinzu
3. Prüfe, ob E-Mail angekommen ist

### 7.3 Test-Wahl durchführen

1. Öffne den Link aus der E-Mail
2. Wähle einen Kandidaten
3. Gib Stimme ab
4. Prüfe Ergebnisse im Admin-Panel

### 7.4 Datenlöschung testen

Nach der Wahl sollten alle Daten automatisch gelöscht werden. Test:

```sql
-- Verbinde dich zur Datenbank
DELETE FROM votes;
DELETE FROM voting_tokens;
DELETE FROM facilities;
DELETE FROM candidates;
```

## 🔥 Schritt 8: Go-Live Vorbereitung

### 8.1 Hochverfügbarkeit sicherstellen

**Wahlzeitraum: 22.11. - 30.11.2025**

1. **Scaling React**:
   - Auto-Scaling aktivieren
   - Health Checks konfigurieren
   - Monitoring aktivieren

2. **Scalingo**:
   - Connection Pooling prüfen (max 10 Connections)
   - Backup-Schedule einrichten (täglich während Wahl)

3. **Frontend**:
   - CDN aktiviert (automatisch bei Netlify/Vercel)
   - Caching konfiguriert

### 8.2 Monitoring einrichten

1. **Uptime Monitoring**:
   - [UptimeRobot](https://uptimerobot.com) (kostenlos)
   - Prüfe alle 5 Minuten
   - Alert per E-Mail/SMS

2. **Error Tracking**:
   - Optional: [Sentry](https://sentry.io) für Frontend + Backend

### 8.3 Backup-Plan

1. **Datenbank-Backup**:
   ```bash
   # Täglich während Wahlzeitraum
   mysqldump -h <host> -P <port> -u <user> -p <database> > backup-$(date +%Y%m%d).sql
   ```

2. **Code-Backup**:
   - Git Repository als Backup
   - Latest Release taggen: `git tag v1.0.0`

## 📞 Support & Troubleshooting

### Häufige Probleme

**Backend startet nicht:**
- Prüfe Umgebungsvariablen
- Prüfe Datenbank-Connection
- Logs anschauen: `scaling-react logs`

**E-Mails kommen nicht an:**
- Prüfe Lettermint API-Key
- Prüfe Spam-Ordner
- Lettermint Dashboard → Logs

**Frontend kann Backend nicht erreichen:**
- Prüfe CORS-Einstellungen in Backend
- Prüfe `VITE_API_URL` in Frontend `.env`
- Browser Console für Fehler prüfen

### Support-Kontakte

- **Scaling React**: support@scaling-react.com
- **Scalingo**: support@scalingo.com
- **Lettermint**: support@lettermint.com
- **Netlify**: support@netlify.com

## ✅ Checkliste vor Go-Live

- [ ] Datenbank deployed und getestet
- [ ] Backend deployed und läuft
- [ ] Frontend deployed und läuft
- [ ] E-Mail-Versand funktioniert
- [ ] AV-Verträge abgeschlossen
- [ ] Admin-Passwort geändert
- [ ] Test-Wahl durchgeführt
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategy aktiv
- [ ] Alle Kandidaten hochgeladen
- [ ] Alle Einrichtungen registriert
- [ ] Wahlzeitraum korrekt konfiguriert
- [ ] Hochverfügbarkeit sichergestellt (22.-30.11.)

## 🎉 Nach der Wahl

1. **Daten exportieren**:
   - Admin-Panel → Ergebnisse → CSV exportieren
   - An Hessisches Ministerium senden

2. **Daten löschen**:
   ```sql
   DELETE FROM votes;
   DELETE FROM voting_tokens;
   DELETE FROM facilities;
   DELETE FROM newsletter_subscriptions;
   DELETE FROM audit_log;
   ```

3. **Server herunterfahren** (optional):
   - Scaling React: App pausieren
   - Scalingo: Database downgraden oder löschen

---

**Bei Fragen während des Deployments:** Dokumentiere jeden Schritt und speichere alle Credentials sicher!
