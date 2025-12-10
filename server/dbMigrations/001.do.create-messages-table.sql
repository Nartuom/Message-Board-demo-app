CREATE TABLE messages (
  id UUID NOT NULL,
  message VARCHAR,
  liked BOOLEAN NOT NULL,
  liked_count INT NOT NULL DEFAULT 0,
  visibility VARCHAR NOT NULL
);