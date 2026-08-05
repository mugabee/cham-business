-- Run this once against the live database via phpMyAdmin's SQL tab.
-- Lets visitors subscribe to be emailed when a new job opening is
-- published, instead of hitting a dead end when /careers has nothing open.

CREATE TABLE IF NOT EXISTS job_alert_subscribers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  email            VARCHAR(255) NOT NULL UNIQUE,
  unsubscribe_token CHAR(64) NOT NULL UNIQUE,
  subscribed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at  DATETIME NULL
) ENGINE=InnoDB;
