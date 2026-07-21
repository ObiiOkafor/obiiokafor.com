CREATE TABLE IF NOT EXISTS book_waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL UNIQUE,
  first_name TEXT,
  source_page TEXT NOT NULL DEFAULT '/book',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_book_waitlist_created_at
  ON book_waitlist (created_at DESC);
