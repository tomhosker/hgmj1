-- Run me on the database for the HGMJ app using:
--   heroku pg:psql --app hgmj < create_drop.sql

-- Remember that PostgreSQL will changes the names of columns, tables, etc
-- to all lower case unless quotation marks are used.

DROP TABLE IF EXISTS JournalEntry;
CREATE TABLE JournalEntry
(
  id SERIAL PRIMARY KEY,
  painScore INT NOT NULL,
  theTimeStamp BIGINT NOT NULL,
  remarks VARCHAR(999)
);
