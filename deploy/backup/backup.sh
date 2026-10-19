#!/bin/sh
# Daily compressed pg_dump of the app database, kept for KEEP_DAYS days.
# Runs forever inside the `backup` container (see docker-compose.yml).
set -eu

KEEP_DAYS="${KEEP_DAYS:-14}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"

while true; do
  file="/backups/hat_akhrak_$(date +%Y%m%d_%H%M%S).sql.gz"
  # pg_dump compresses itself (-Z) so its exit status is the real one: a pipe into gzip would hide a failed dump.
  if pg_dump -h db -U hat -Z 6 -f "$file.tmp" hat_akhrak; then
    mv "$file.tmp" "$file"
    echo "backup written: $file ($(du -h "$file" | cut -f1))"
  else
    rm -f "$file.tmp"
    echo "BACKUP FAILED at $(date)" >&2
  fi
  # Uploaded images (deal photos, invoice photos), archived the same way.
  if [ -d /uploads ]; then
    imgs="/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz"
    if tar -czf "$imgs.tmp" -C /uploads . ; then
      mv "$imgs.tmp" "$imgs"
      echo "uploads archived: $imgs ($(du -h "$imgs" | cut -f1))"
    else
      rm -f "$imgs.tmp"
      echo "UPLOADS BACKUP FAILED at $(date)" >&2
    fi
  fi
  find /backups \( -name 'hat_akhrak_*.sql.gz' -o -name 'uploads_*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete
  sleep "$INTERVAL"
done
