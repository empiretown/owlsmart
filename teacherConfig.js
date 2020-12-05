const TeacherStrategy = require('passport-local').Strategy;
const { authenticate} = require('passport');
const bcrypt = require('bcrypt');
const {Pool} = require('pg');

const connectionString = process.env.DATABASE_URL || "postgres://owlsmart01user:owl@localhost:5432/owlsmart";
const pool = new Pool ({connectionString: connectionString});

function teacherInitialized(Passport) {
    const authenticateTeacherUser = (teacherusername, pass, done)=> {
        pool.query(
            'SELECT * FROM teacher WHERE username = $1::text', [teacherusername],
            (err, results) => {
                if (err) {
                    throw error;
                } 
                console.log(results.rows)

                if (results.rows.length > 0)  {
                    const teacher = results.rows[0];
                    console.log(teacher);
                    if (teacher!= null ){
                        bcrypt.compare(pass, teacher.pass, (err, isMatch) =>{
                            if (err) {
                               console.log(err);
                            } else if(isMatch) {
                                return done(null, teacher)
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

    Passport.use("teacher-login", new TeacherStrategy ({
        usernameField: "username",
        passwordField: "password"
    }, authenticateTeacherUser)
    );

    Passport.serializeUser((teacher, done) => done(null, teacher.teacher_id));

    Passport.deserializeUser((teacher_id, done) => {
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