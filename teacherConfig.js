const TeacherStrategy = require('passport-local').Strategy;
const { authenticate} = require('passport');
const bcrypt = require('bcrypt');
const {Pool} = require('pg');

const connectionString = process.env.DATABASE_URL || "postgres://owlsmart01user:owl@localhost:5432/owlsmart";
const pool = new Pool ({connectionString: connectionString});

function teacherInitialized(passport) {
    const authenticateTeacherUser = (teacherusername, pass, done)=> {
        pool.query(
            'SELECT * FROM teacher WHERE username = $1::text', [teacherusername],
            (err, results) => {
                if (err) {
                    throw error;
                } 
                console.log(results.rows)

                if (results.rows.length > 0)  {
                    const user = results.rows[0];
                    console.log(user);
                    if (user != null ){
                        bcrypt.compare(pass, user.pass, (err, isMatch) =>{
                            if (err) {
                               console.log(err);
                            } else if(isMatch) {
                                return done(null, user)
                            } else {
                                return done(null, false, ({message: "Password is incorrect. Try again?"}));
                            }
                        } )

                    }
                    
                } else {
                    //console.log(teacher);
                    return done(null, false, ({message: "Users email invalid"}));
                }
                
            }
            
        )
    }

    passport.use('local-teacher-login', new TeacherStrategy ({
        usernameField: "username",
        passwordField: "password"
    }, authenticateTeacherUser)
    );

    passport.serializeUser((teacher, done) => done(null, teacher.teacher_id));

    passport.deserializeUser((teacher_id, done) => {
        pool.query(
            'SELECT * FROM teacher WHERE teacher_id = $1', [teacher_id], (err, result) => {
                if (err) {
                    throw err;
                }
                return done(null, result.rows[0]);
            }
        )
    })
    
}

module.exports = teacherInitialized;