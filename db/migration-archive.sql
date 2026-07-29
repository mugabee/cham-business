-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds a soft-delete/archive column to the four back-office tables.

ALTER TABLE applications ADD COLUMN archived_at DATETIME NULL;
CREATE INDEX idx_applications_archived_at ON applications(archived_at);

ALTER TABLE borrowers ADD COLUMN archived_at DATETIME NULL;
CREATE INDEX idx_borrowers_archived_at ON borrowers(archived_at);

ALTER TABLE loans ADD COLUMN archived_at DATETIME NULL;
CREATE INDEX idx_loans_archived_at ON loans(archived_at);

ALTER TABLE payments ADD COLUMN archived_at DATETIME NULL;
CREATE INDEX idx_payments_archived_at ON payments(archived_at);
