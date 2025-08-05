CREATE TABLE IF NOT EXISTS history (
    id INTEGER,
    chain TEXT NOT NULL,
    date_time TEXT NOT NULL, -- Format: "YYYY-MM-DD HH:MM:SS.SSS"

    PRIMARY KEY (id)
);
