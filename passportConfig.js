const LocalStrategy = require('passport-local').Strategy;
const { authenticate } = require('passport');
const bcrypt = require('bcrypt');
const {Pool} = require('pg');

const connectionString = process.env.DATABASE_URL || "postgres://owlsmart01user:owl@localhost:5432/owlsmart";
const pool = new Pool ({connectionString: connectionString});

function initialize(passport) {
    const authenticateUser = (email, pass, done)=> {
        pool.query(
            'SELECT * FROM users WHERE email = $1::text', [email],
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
                    console.log(user);
                    return done(null, false, ({message: "Users email invalid"}));
                }
                
            }
        )
    }
    
    passport.use(new LocalStrategy ({
        usernameField: "email",
        passwordField: "password"
    }, authenticateUser)
    );
    passport.serializeUser((users, done) => done(null, users.id));

    passport.deserializeUser((id, done) => {
        pool.query(
            'SELECT * FROM users WHERE id = $1', [id], (err, result) => {
                if (err) {
                    throw err;
                }
                return done(null, result.rows[0]);
            }
        )
    })
}

module.exports = initialize;