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
  archived_at      DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_borrowers_email (email)
) ENGINE=InnoDB;
CREATE INDEX idx_borrowers_phone ON borrowers(phone);
CREATE INDEX idx_borrowers_full_name ON borrowers(full_name);
CREATE INDEX idx_borrowers_archived_at ON borrowers(archived_at);

-- Borrower portal: passwordless (OTP-only) accounts, reusing the borrowers
-- row itself as the "account" -- an email match is all that's needed.

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

CREATE TABLE IF NOT EXISTS applications (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id           INT NULL,
  full_name             VARCHAR(255) NOT NULL,
  phone                 VARCHAR(30)  NOT NULL,
  email                 VARCHAR(255) NULL,
  loan_type             VARCHAR(100) NOT NULL,
  amount_requested      INT UNSIGNED NOT NULL,
  purpose_category      VARCHAR(100) NULL,
  purpose               VARCHAR(1000) NOT NULL,
  monthly_income        INT UNSIGNED NOT NULL,
  desired_term_months   SMALLINT UNSIGNED NULL,
  occupation            VARCHAR(255) NULL,
  marital_status        ENUM('single','married','divorced') NULL,
  work_address          VARCHAR(500) NULL,
  collateral_address     VARCHAR(500) NULL,
  fee_amount            INT UNSIGNED NULL,
  status                ENUM('new','reviewing','approved','rejected') NOT NULL DEFAULT 'new',
  submitted_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by           INT NULL,
  reviewed_at           DATETIME NULL,
  notes                 VARCHAR(2000) NULL,
  archived_at           DATETIME NULL,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_applications_archived_at ON applications(archived_at);

CREATE TABLE IF NOT EXISTS application_documents (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  application_id     INT NOT NULL,
  document_type      VARCHAR(50) NOT NULL,
  original_filename  VARCHAR(255) NOT NULL,
  stored_filename    VARCHAR(255) NOT NULL,
  mime_type          VARCHAR(100) NOT NULL,
  file_size          INT UNSIGNED NOT NULL,
  uploaded_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);

CREATE TABLE IF NOT EXISTS loans (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id            INT NOT NULL,
  application_id         INT NULL,
  principal              INT UNSIGNED NOT NULL,
  interest_rate_monthly  DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
  term_months            SMALLINT UNSIGNED NOT NULL,
  method                 VARCHAR(50) NOT NULL DEFAULT 'reducing_balance',
  status                 ENUM('active','paid_off','written_off','cancelled') NOT NULL DEFAULT 'active',
  disbursed_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  disbursed_by           INT NULL,
  paid_off_at            DATETIME NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  archived_at            DATETIME NULL,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE RESTRICT,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (disbursed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_archived_at ON loans(archived_at);

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
  archived_at  DATETIME NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
  FOREIGN KEY (recorded_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
CREATE INDEX idx_payments_archived_at ON payments(archived_at);

-- Borrower-submitted evidence of payment, reviewed by staff before it
-- becomes a real `payments` row via the existing recordPayment() flow.
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

-- Consumer protection: penalty ledger (capped by the in duplum rule),
-- guarantors, collateral register/deregister tracking, and a formal
-- complaints channel. See db/migration-consumer-protection.sql for the
-- one-off ALTER/CREATE statements applied against the live database.

CREATE TABLE IF NOT EXISTS loan_penalties (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  loan_id      INT NOT NULL,
  amount       INT UNSIGNED NOT NULL,
  reason       VARCHAR(500) NOT NULL,
  status       ENUM('pending','paid','waived') NOT NULL DEFAULT 'pending',
  applied_by   INT NULL,
  applied_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_by  INT NULL,
  resolved_at  DATETIME NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (applied_by) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_loan_penalties_loan_id ON loan_penalties(loan_id);

CREATE TABLE IF NOT EXISTS guarantors (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  loan_id                  INT NOT NULL,
  full_name                VARCHAR(255) NOT NULL,
  phone                    VARCHAR(30) NOT NULL,
  email                    VARCHAR(255) NULL,
  address                  VARCHAR(500) NULL,
  relationship_to_borrower VARCHAR(255) NULL,
  repayment_notified_at    DATETIME NULL,
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by               INT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_guarantors_loan_id ON guarantors(loan_id);

CREATE TABLE IF NOT EXISTS loan_collateral (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  loan_id          INT NOT NULL,
  description      VARCHAR(1000) NOT NULL,
  estimated_value  INT UNSIGNED NULL,
  registered_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registered_by    INT NULL,
  deregistered_at  DATETIME NULL,
  deregistered_by  INT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  FOREIGN KEY (registered_by) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (deregistered_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_collateral_loan_id ON loan_collateral(loan_id);

CREATE TABLE IF NOT EXISTS complaints (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id      INT NULL,
  loan_id          INT NULL,
  application_id   INT NULL,
  category         VARCHAR(100) NOT NULL,
  description      VARCHAR(2000) NOT NULL,
  channel          ENUM('portal','staff') NOT NULL DEFAULT 'portal',
  status           ENUM('open','investigating','resolved','rejected') NOT NULL DEFAULT 'open',
  resolution_notes VARCHAR(2000) NULL,
  submitted_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_by      INT NULL,
  resolved_at      DATETIME NULL,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE SET NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_borrower_id ON complaints(borrower_id);

-- Careers/hiring: staff post job openings, candidates apply publicly with
-- a resume upload, and staff move each applicant through a hiring pipeline.
-- See db/migration-careers.sql for the one-off statements applied against
-- the live database.

CREATE TABLE IF NOT EXISTS job_postings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  department       VARCHAR(255) NULL,
  location         VARCHAR(255) NOT NULL,
  employment_type  ENUM('full_time','part_time','contract','internship') NOT NULL DEFAULT 'full_time',
  summary          VARCHAR(500) NOT NULL,
  description      TEXT NOT NULL,
  requirements     TEXT NOT NULL,
  status           ENUM('draft','open','closed') NOT NULL DEFAULT 'draft',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by       INT NULL,
  closed_at        DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_job_postings_status ON job_postings(status);

CREATE TABLE IF NOT EXISTS job_applicants (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  job_posting_id            INT NOT NULL,
  full_name                 VARCHAR(255) NOT NULL,
  email                     VARCHAR(255) NOT NULL,
  phone                     VARCHAR(30) NOT NULL,
  cover_letter              VARCHAR(3000) NULL,
  resume_original_filename  VARCHAR(255) NOT NULL,
  resume_stored_filename    VARCHAR(255) NOT NULL,
  resume_mime_type          VARCHAR(100) NOT NULL,
  resume_file_size          INT UNSIGNED NOT NULL,
  status                    ENUM('new','screening','interview','offer','hired','rejected') NOT NULL DEFAULT 'new',
  rating                    ENUM('unrated','strong','maybe','not_fit') NOT NULL DEFAULT 'unrated',
  notes                     VARCHAR(2000) NULL,
  submitted_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by               INT NULL,
  reviewed_at               DATETIME NULL,
  FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_job_applicants_posting_id ON job_applicants(job_posting_id);
CREATE INDEX idx_job_applicants_status ON job_applicants(status);

CREATE TABLE IF NOT EXISTS job_applicant_status_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  applicant_id  INT NOT NULL,
  status        ENUM('new','screening','interview','offer','hired','rejected') NOT NULL,
  notes         VARCHAR(2000) NULL,
  changed_by    INT NULL,
  changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES job_applicants(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_job_applicant_status_history_applicant_id ON job_applicant_status_history(applicant_id);

CREATE TABLE IF NOT EXISTS job_alert_subscribers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  email            VARCHAR(255) NOT NULL UNIQUE,
  unsubscribe_token CHAR(64) NOT NULL UNIQUE,
  subscribed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at  DATETIME NULL
) ENGINE=InnoDB;

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
