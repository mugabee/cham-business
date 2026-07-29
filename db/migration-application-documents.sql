-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds the expanded application-form fields and a document-upload table.

ALTER TABLE applications
  ADD COLUMN purpose_category VARCHAR(100) NULL AFTER amount_requested,
  ADD COLUMN desired_term_months SMALLINT UNSIGNED NULL AFTER monthly_income,
  ADD COLUMN occupation VARCHAR(255) NULL AFTER desired_term_months,
  ADD COLUMN marital_status ENUM('single','married','divorced') NULL AFTER occupation,
  ADD COLUMN work_address VARCHAR(500) NULL AFTER marital_status,
  ADD COLUMN collateral_address VARCHAR(500) NULL AFTER work_address,
  ADD COLUMN fee_amount INT UNSIGNED NULL AFTER collateral_address;

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
