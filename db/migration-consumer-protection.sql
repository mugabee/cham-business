-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds tables/columns needed for BNR Regulation N 55/2022 (financial
-- service consumer protection) compliance: penalty capping (in duplum
-- rule), guarantor disclosures, collateral register/deregister tracking,
-- a formal complaints channel, and cooling-off cancellation.

ALTER TABLE loans
  MODIFY status ENUM('active','paid_off','written_off','cancelled') NOT NULL DEFAULT 'active';

ALTER TABLE loans
  ADD COLUMN paid_off_at DATETIME NULL AFTER disbursed_by;

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

-- Complaints are deliberately separate from payment_proofs: a borrower
-- can be dissatisfied with anything (service, fees, treatment), not just
-- disputing a payment.
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
