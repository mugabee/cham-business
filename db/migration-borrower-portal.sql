-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds the borrower portal: OTP codes, borrower sessions, and
-- staff-reviewed payment proofs. Also makes borrowers.email unique
-- (safe with existing data since all current borrowers have a NULL
-- email -- MySQL allows multiple NULLs in a unique index).

ALTER TABLE borrowers ADD UNIQUE KEY uniq_borrowers_email (email);

CREATE TABLE IF NOT EXISTS otp_codes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(255) NOT NULL,
  code_hash    CHAR(64) NOT NULL,
  purpose      VARCHAR(50) NOT NULL,
  attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL,
  consumed_at  DATETIME NULL
) ENGINE=InnoDB;
CREATE INDEX idx_otp_codes_email_purpose ON otp_codes(email, purpose);

CREATE TABLE IF NOT EXISTS borrower_sessions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  token_hash   CHAR(64) NOT NULL UNIQUE,
  borrower_id  INT NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_borrower_sessions_expires_at ON borrower_sessions(expires_at);

CREATE TABLE IF NOT EXISTS payment_proofs (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  loan_id            INT NOT NULL,
  borrower_id        INT NOT NULL,
  amount_claimed     INT UNSIGNED NOT NULL,
  method             ENUM('mtn','airtel','bank') NOT NULL,
  reference          VARCHAR(255) NULL,
  original_filename  VARCHAR(255) NOT NULL,
  stored_filename    VARCHAR(255) NOT NULL,
  mime_type          VARCHAR(100) NOT NULL,
  file_size          INT UNSIGNED NOT NULL,
  status             ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  staff_note         VARCHAR(1000) NULL,
  reviewed_by        INT NULL,
  reviewed_at        DATETIME NULL,
  payment_id         INT NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX idx_payment_proofs_loan_id ON payment_proofs(loan_id);
