
CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    Username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    pass VARCHAR(100) NOT NULL,
    unique(email)
);

INSERT INTO users (Username, email, pass) VALUES ('Greg1', 'test@gmail.com', 'Qwerty1');