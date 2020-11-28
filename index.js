var express = require ('express');
var app = express();
const ejs = require("ejs");
var bcrypt = require('bcrypt');
const {Pool} = require('pg');
var session = require ('express-session');
const flash = require('express-flash');

const passport = require('passport');

const intializedPassport = require('./passportConfig');
 intializedPassport(passport);

const PORT = process.env.PORT || 4000

const connectionString = process.env.DATABASE_URL || "postgres://owlsmart01user:owl@localhost:5432/owlsmart";
const pool = new Pool ({connectionString: connectionString});

app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false
    })
)

app.set('view engine', 'ejs')
app.use(passport.initialize())  
app.use(passport.session()) 
app.use(flash())

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/users/login", (req, res) => {

   res.render('login')
});

app.get("/user/register", (req, res) => {
    res.render("register")
});

app.get("/users/logout", (req, res) => {
   req.logout();
   res.render('index', {massage: "You are logged out sucessfully"});
});

app.get("/users/dashboard", (req, res) => {
    res.render("dashboard", {
        user: req.user.username
    })
});

app.post('/user/register', async (req, res) => {
  
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;
  
  let errors = [];
  
  console.log ({
      username, 
      email,
      password,
      password2
  });

 

  if (!username || !email || !password || !password2) {
      errors.push({message: "Please enter all fields"});
  }
  

if (password.length < 6) {
      errors.push({ message: "Password must be at least 6 characters"});
}

if (password !== password2) {
    errors.push({ message: "Password do not match" });
}
if (errors.length > 0) {
    res.render('register', {errors, username, email, password, password2});
} else {
   let  hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);


    
    pool.query(
        `SELECT * FROM users WHERE email = $1::text`,
        [email],
        (err, results) => {
            if (err) {
                console.log(err)
            }
            
            console.log(results.rows);
        
            if(results.rows.length > 0) {
                errors.push({message: "Email already registered"});
                res.render("register", { errors });
                // return res.render("register", {
                //   message: "Username already registered"
                // });
       } else {
              
           pool.query(`INSERT INTO users (Username, email, pass)
                            VALUES ($1::text, $2, $3)
                            RETURNING id, pass`,
                            [username, email, hashedPassword],
                     (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log(results.rows);
                        req.flash('success_msg', 'Welcome, you can login in');
                        res.redirect('/users/login');
                     });
                  

     }

            
    });
}


  
});

app.post('/users/login', passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
})); 

app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});