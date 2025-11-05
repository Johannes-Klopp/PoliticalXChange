# Landesheimrat-Wahl Platform

Digitale Wahlplattform für die Wahl des Landesheimrats Hessen 2025.

## 📋 Projektübersicht

Diese WebApp ermöglicht stationären Einrichtungen der Jugendhilfe in Hessen, anonym und sicher an der Wahl des Landesheimrats teilzunehmen.

### Hauptfunktionen

- ✅ **Kandidaten-Präsentation**: Übersichtliche Darstellung aller Kandidaten mit Steckbriefen
- ✅ **Anonyme Wahl**: Einmaliger Token pro Einrichtung, keine Zuordnung Stimme ↔ E-Mail
- ✅ **Admin-Panel**: Kandidaten- und Einrichtungsverwaltung, Ergebnis-Export
- ✅ **E-Mail-Versand**: Automatischer Versand von Voting-Links via Lettermint
- ✅ **DSGVO-konform**: Automatische Datenlöschung nach Wahl
- ✅ **WCAG 2.2 AA**: Barrierefrei gestaltet
- ✅ **Security**: Rate Limiting, Helmet, JWT-Auth

## 🏗️ Tech-Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Vite

### Backend
- Node.js + Express
- MySQL
- JWT Authentication
- Bcrypt
- Nodemailer / Lettermint API
- Helmet + CORS

## 📦 Installation & Entwicklung

### Voraussetzungen

- Node.js 18+
- MySQL 8+
- npm oder yarn

### 1. Repository klonen

```bash
cd landesheimrat-wahl-project
```

### 2. Backend einrichten

```bash
cd backend
npm install

# .env Datei anpassen (siehe .env.example)
cp .env.example .env

# MySQL Datenbank erstellen
mysql -u root -p < database.sql

# Server starten
npm run dev
```

Der Backend-Server läuft auf `http://localhost:3000`

### 3. Frontend einrichten

```bash
cd ../frontend
npm install

# .env Datei ist bereits vorhanden
# Server starten
npm run dev
```

Das Frontend läuft auf `http://localhost:5173`

### 4. Admin-Zugang

**Standard-Login:**
- Benutzername: `admin`
- Passwort: `ChangeMeNow123!`

⚠️ **WICHTIG**: Passwort sofort nach erstem Login ändern!

## 🚀 Deployment

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Anweisungen.

### Quick Start

1. **Accounts erstellen:**
   - [Scaling React](https://scaling-react.com) - Backend Hosting
   - [Scalingo](https://scalingo.com) - MySQL Datenbank
   - [Lettermint](https://lettermint.com) - E-Mail-Versand

2. **Backend deployen:**
   ```bash
   cd backend
   # Umgebungsvariablen in Scaling React Dashboard setzen
   npm run build
   scaling-react deploy
   ```

3. **Frontend deployen:**
   ```bash
   cd frontend
   npm run build
   # dist/ Ordner auf Static Hosting (Netlify/Vercel) hochladen
   ```

## 📚 API Dokumentation

### Public Endpoints

- `GET /api/candidates` - Alle Kandidaten abrufen
- `GET /api/candidates/:id` - Einzelnen Kandidaten abrufen
- `GET /api/votes/verify-token?token=XXX` - Token-Gültigkeit prüfen
- `POST /api/votes/submit` - Stimme abgeben

### Admin Endpoints (JWT erforderlich)

- `POST /api/auth/login` - Admin-Login
- `POST /api/candidates` - Kandidat erstellen
- `POST /api/facilities` - Einrichtung hinzufügen
- `GET /api/votes/results` - Wahlergebnisse abrufen
- `GET /api/votes/export` - Ergebnisse als CSV exportieren

## 🔒 Sicherheit

- **JWT-basierte Authentifizierung** für Admin-Bereich
- **Rate Limiting** auf allen Endpoints
- **Helmet.js** für Security Headers
- **CORS** konfiguriert
- **Bcrypt** für Passwort-Hashing
- **Einmalige Tokens** für Voting
- **Audit Log** für alle Aktionen

## 📊 Datenschutz (DSGVO)

- Nur notwendige Daten werden gespeichert
- Keine Zuordnung Stimme ↔ E-Mail/Token
- Automatische Datenlöschung nach Wahl
- AV-Verträge mit allen Drittanbietern
- Server in EU (DSGVO-konform)

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test
```

## 📞 Support

Bei Fragen:
- **Technical Lead**: Political XChange i.G.
- **E-Mail**: noreply@landesheimrat-wahl.de

## 📄 Lizenz

Dieses Projekt wurde im Auftrag des Hessischen Ministeriums für Arbeit, Integration, Jugend und Soziales entwickelt.

© 2025 Political XChange i.G.
