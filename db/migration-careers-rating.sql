-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds a quick internal screening tag staff can set on an applicant,
-- separate from the formal pipeline status.

ALTER TABLE job_applicants
  ADD COLUMN rating ENUM('unrated','strong','maybe','not_fit') NOT NULL DEFAULT 'unrated' AFTER status;
