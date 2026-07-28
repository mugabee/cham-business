-- Run this once against the MySQL database created in cPanel
-- (e.g. via phpMyAdmin's "Import" or "SQL" tab).

CREATE TABLE IF NOT EXISTS staff (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'staff',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  token_hash   CHAR(64) NOT NULL UNIQUE,
  staff_id     INT NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  token_hash   CHAR(64) NOT NULL UNIQUE,
  staff_id     INT NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NOT NULL,
  used_at      DATETIME NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Phase 2: loan back-office (applications, borrowers, loans, schedule, payments, audit log)

CREATE TABLE IF NOT EXISTS borrowers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  full_name        VARCHAR(255) NOT NULL,
  phone            VARCHAR(30)  NOT NULL,
  email            VARCHAR(255) NULL,
  national_id_enc  VARCHAR(500) NULL,
  monthly_income   INT UNSIGNED NOT NULL,
  address          VARCHAR(500) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by       INT NULL,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_borrowers_phone ON borrowers(phone);
CREATE INDEX idx_borrowers_full_name ON borrowers(full_name);

CREATE TABLE IF NOT EXISTS applications (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id       INT NULL,
  full_name         VARCHAR(255) NOT NULL,
  phone             VARCHAR(30)  NOT NULL,
  email             VARCHAR(255) NULL,
  loan_type         VARCHAR(100) NOT NULL,
  amount_requested  INT UNSIGNED NOT NULL,
  purpose           VARCHAR(1000) NOT NULL,
  monthly_income    INT UNSIGNED NOT NULL,
  status            ENUM('new','reviewing','approved','rejected') NOT NULL DEFAULT 'new',
  submitted_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by       INT NULL,
  reviewed_at       DATETIME NULL,
  notes             VARCHAR(2000) NULL,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);

CREATE TABLE IF NOT EXISTS loans (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id            INT NOT NULL,
  application_id         INT NULL,
  principal              INT UNSIGNED NOT NULL,
  interest_rate_monthly  DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
  term_months            SMALLINT UNSIGNED NOT NULL,
  method                 VARCHAR(50) NOT NULL DEFAULT 'reducing_balance',
  status                 ENUM('active','paid_off','written_off') NOT NULL DEFAULT 'active',
  disbursed_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  disbursed_by           INT NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE RESTRICT,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (disbursed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);

CREATE TABLE IF NOT EXISTS repayment_schedule (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  loan_id            INT NOT NULL,
  instalment_number  SMALLINT UNSIGNED NOT NULL,
  due_date           DATE NOT NULL,
  principal_due      INT UNSIGNED NOT NULL,
  interest_due       INT UNSIGNED NOT NULL,
  total_due          INT UNSIGNED NOT NULL,
  amount_paid        INT UNSIGNED NOT NULL DEFAULT 0,
  status             ENUM('pending','partial','paid') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_loan_instalment (loan_id, instalment_number)
) ENGINE=InnoDB;
CREATE INDEX idx_schedule_loan_id ON repayment_schedule(loan_id);
CREATE INDEX idx_schedule_due_status ON repayment_schedule(due_date, status);

CREATE TABLE IF NOT EXISTS payments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  loan_id      INT NOT NULL,
  amount       INT UNSIGNED NOT NULL,
  method       ENUM('mtn','airtel','bank') NOT NULL,
  reference    VARCHAR(255) NULL,
  paid_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recorded_by  INT NULL,
  notes        VARCHAR(1000) NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
  FOREIGN KEY (recorded_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  staff_id    INT NULL,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50) NOT NULL,
  entity_id   INT NOT NULL,
  detail      TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);
