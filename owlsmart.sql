
CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    Username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    pass VARCHAR(100) NOT NULL,
    unique(email)
);

INSERT INTO users (Username, email, pass) VALUES ('Greg1', 'test@gmail.com', 'Qwerty1');

CREATE TABLE teacher (
    id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    pass VARCHAR(50) NOT NULL,
    schoolname VARCHAR(50),
    unique(email),
    FOREIGN KEY (schoolname) REFERENCES school(schoolname)

);

CREATE TABLE school(
    id SERIAL PRIMARY KEY NOT NULL, 
    schoolname VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    unique(email), CONSTRAINT UX_DERIVED_RELATION UNIQUE (schoolname)
);

INSERT INTO school (schoolname, email) VALUES ('Holy Trinity Sec School', 'test5@gmail.com');
INSERT INTO teacher (username, email, pass,schoolname) VALUES ('Jude', 'jude1@gmail.com', 'Qwerty2', 'Holy Trinity Sec School');
