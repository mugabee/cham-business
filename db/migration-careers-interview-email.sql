-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Tracks whether/when the interview-details email was sent to an
-- applicant, so staff can see who still needs one at a glance.

ALTER TABLE job_applicants
  ADD COLUMN interview_email_sent_at DATETIME NULL AFTER reviewed_at;
