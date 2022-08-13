CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    important BOOLEAN NOT NULL,
    password TEXT NOT NULL,
    reminder TIMESTAMP NULL
);