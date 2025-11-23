-- Migration: Newsletter-Erweiterung und Multi-Kandidaten-Voting
-- Führe diese Datei aus, wenn du eine bestehende Datenbank aktualisieren möchtest

USE landesheimrat_wahl;

-- 1. Newsletter-Tabelle erweitern
ALTER TABLE newsletter_subscriptions
ADD COLUMN group_name VARCHAR(255) NOT NULL DEFAULT 'Unbekannt' AFTER email,
ADD COLUMN facility_name VARCHAR(255) NOT NULL DEFAULT 'Unbekannt' AFTER group_name,
ADD COLUMN region VARCHAR(255) AFTER facility_name,
ADD INDEX idx_facility (facility_name);

-- 2. Votes-Tabelle erweitern für Multi-Kandidaten-Voting
ALTER TABLE votes
ADD COLUMN vote_session_id VARCHAR(64) NOT NULL DEFAULT '' AFTER id,
ADD INDEX idx_session (vote_session_id);

-- 3. Bestehende Votes eine Session-ID zuweisen (falls vorhanden)
UPDATE votes
SET vote_session_id = MD5(CONCAT(id, voted_at, candidate_id))
WHERE vote_session_id = '';

-- Fertig!
SELECT 'Migration erfolgreich abgeschlossen!' as status;
