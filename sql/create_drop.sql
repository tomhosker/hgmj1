-- Run me on the database for the HarvestHub app using:
--   heroku pg:psql --app harvesthub < create_drop.sql

-- Remember that PostgreSQL will changes the names of columns, tables, etc
-- to all lower case unless quotation marks are used.

DROP TABLE IF EXISTS JournalEntry;
CREATE TABLE JournalEntry
(
  id INT PRIMARY KEY,
  painScore INT NOT NULL,
  theTimeStamp INT NOT NULL,
  remarks VARCHAR(999)
);
