-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds a full pipeline timeline for job applicants -- previously a
-- status change overwrote the last one; now every change is kept.

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
