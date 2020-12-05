
CREATE TABLE users (
    id SERIAL PRIMARY KEY NOT NULL,
    Username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    pass VARCHAR(100) NOT NULL,
    unique(email)
    

);

INSERT INTO users (Username, email, pass) VALUES ('Greg1', 'test@gmail.com', 'Qwerty1');

CREATE TABLE teacher (
    teacher_id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    pass VARCHAR(100) NOT NULL,
    schoolname VARCHAR(50),
    unique(email),
    FOREIGN KEY (schoolname) REFERENCES school(schoolname),
    CONSTRAINT DERIVED_RELATION UNIQUE (teacher_id)
);

CREATE TABLE school(
    id SERIAL PRIMARY KEY NOT NULL, 
    schoolname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    unique(email), CONSTRAINT UX_DERIVED_RELATION UNIQUE (schoolname)
);

CREATE TABLE lesson {
    lesson_id SERIAl PRIMARY KEY NOT NULL,

}

CREATE TABLE classes (
    class_id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(50) NOT NULL,
    descr VARCHAR(100) NOT NULL,
    teacher_id  SERIAL NOT NULL,
    img bytea,
    lesson_num VARCHAR(50) NOT NULL,
    lesson_title VARCHAR(50) NOT NULL,
    lesson_body VARCHAR(500) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
);

INSERT INTO classes (title, descr, id, img, lesson_num, lesson_title, lesson_body) VALUES ('Hello World', 'In this class we learn how to make our first website start with the hello world display', 5 , 'https://i.postimg.cc/02yGSpJ3/Cybersecurity.jpg' ,'Week 01', 'First Website', 'Watch this tutorial for clearer understanding of the this week lesson; https://youtu.be/dt7BLlg9hUo')
I
INSERT INTO school (email, schoolname) VALUES ('htss@gmail.com','Holy Trinity Sec School');
INSERT INTO teacher (username, email, pass,schoolname) VALUES ('Jude', 'jude1@gmail.com', 'Qwerty2', 'Holy Trinity Sec School');

CREATE USER owlsmart01user WITH PASSWORD 'owl';
GRANT SELECT, INSERT, UPDATE ON classes, teacher, school, users to owlsmart01user;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO owlsmart01user;