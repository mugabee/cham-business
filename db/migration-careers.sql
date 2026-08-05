-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Adds the careers/hiring feature: staff post job openings, candidates
-- apply publicly with a resume upload, and staff move each applicant
-- through a hiring pipeline (new -> screening -> interview -> offer ->
-- hired/rejected).

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
  notes                     VARCHAR(2000) NULL,
  submitted_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by               INT NULL,
  reviewed_at               DATETIME NULL,
  FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_job_applicants_posting_id ON job_applicants(job_posting_id);
CREATE INDEX idx_job_applicants_status ON job_applicants(status);
