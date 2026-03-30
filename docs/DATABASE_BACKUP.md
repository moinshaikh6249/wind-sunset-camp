# Database Backup & Recovery Reminders

## 1) Database Backups

- Keep regular backups/snapshots of MongoDB data.
- Verify restore procedures periodically in a non-production environment.

## 2) Configuration Backups

- Keep versioned backups of backend environment templates and deployment configuration.
- Store backup metadata (date, source, restore notes) with each backup.

## 3) Recovery Drills

- Test a full restore path at least once per quarter.
- Record recovery time and any manual steps needed.

## 4) Operational Notes

- Keep backup artifacts in secure access-controlled storage.
- Document ownership and on-call handoff instructions for incidents.
