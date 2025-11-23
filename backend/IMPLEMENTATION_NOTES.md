# Implementierung: Newsletter & Multi-Kandidaten-Voting

## Änderungen

### 1. Newsletter-System erweitert
**Datenbank-Schema:**
- `group_name` - Name der Wohngruppe
- `facility_name` - Name der Einrichtung
- `region` - Region/Standort (optional)

**API-Änderung:**
```javascript
POST /api/newsletter/subscribe
{
  "email": "gruppe-a@einrichtung.de",
  "groupName": "Wohngruppe A",
  "facilityName": "Haus Sonnenblick",
  "region": "Nord-Hessen"  // optional
}
```

### 2. Voting-System: 8 Kandidaten pro Stimme
**Vorher:** 1 Kandidat pro Vote
**Jetzt:** Bis zu 8 Kandidaten in einer Abstimmung

**API-Änderung:**
```javascript
POST /api/votes
{
  "token": "abc123...",
  "candidateIds": [1, 3, 5, 7, 9, 12, 15, 18]  // Array statt einzelne ID
}
```

**Datenbank:**
- Jeder Vote bekommt eine `vote_session_id`
- Alle 8 Kandidaten einer Abstimmung haben die gleiche Session-ID
- Weiterhin anonym (keine Verbindung zu Token/Email)

### 3. Email-System (Lettermint)
**Test-Modus (ohne API-Key):**
- Emails werden in der Console geloggt
- Kein Versand, nur Simulation

**Production (mit API-Key):**
- Setze `LETTERMINT_API_KEY` in .env
- Emails werden via Lettermint API versendet

**Neue Email-Funktionen:**
- `sendNewsletterNotification()` - Benachrichtigung an Wohngruppen, dass Wahl begonnen hat

## Migration bestehender Datenbank

```bash
mysql -u username -p landesheimrat_wahl < migration_newsletter_voting.sql
```

## .env Konfiguration

```env
# Email (Lettermint)
LETTERMINT_API_KEY=your_api_key_here
LETTERMINT_FROM_EMAIL=noreply@landesheimrat-wahl.de
LETTERMINT_FROM_NAME=Landesheimrat-Wahl

# Ohne API-Key läuft das System im Test-Modus
```

## Workflow

1. **Einrichtungen erhalten initiale Email** mit Newsletter-Link
2. **Wohngruppen melden sich an** (email + groupName + facilityName + region)
3. **Admin startet Wahl** - Newsletter-Notification an alle registrierten Gruppen
4. **Wohngruppen wählen** - bis zu 8 Kandidaten auswählbar
5. **Ergebnis-Auswertung** - bestehende Funktionen funktionieren weiterhin

## Frontend-Anpassungen nötig

### Newsletter-Formular
```html
<input name="email" required />
<input name="groupName" required />
<input name="facilityName" required />
<input name="region" />
```

### Voting-Seite
```javascript
// Mehrere Kandidaten auswählbar (max 8)
const [selectedCandidates, setSelectedCandidates] = useState([]);

// Submit
fetch('/api/votes', {
  method: 'POST',
  body: JSON.stringify({
    token: voteToken,
    candidateIds: selectedCandidates  // Array statt einzelne ID
  })
})
```
