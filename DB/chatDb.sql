DROP TABLE IF EXISTS users, chat, message_chat, user_chat CASCADE;

CREATE TABLE users (
  username varchar UNIQUE,
  name varchar
);

CREATE TABLE chat (
  id SERIAL PRIMARY KEY,
  name varchar,
  isGroup boolean
);

CREATE TABLE message_chat (
  id SERIAL PRIMARY KEY,
  message varchar,
  fk_owner_username varchar REFERENCES users(username) ON DELETE CASCADE,
  fk_chat_id integer REFERENCES chat(id) ON DELETE CASCADE
);

CREATE TABLE user_chat (
  id SERIAL PRIMARY KEY,
  fk_username varchar REFERENCES users(username) ON DELETE CASCADE,
  fk_chat_id integer REFERENCES chat(id) ON DELETE CASCADE
);

COMMIT;
