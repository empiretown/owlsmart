var express = require ('express');
var app = express();
const ejs = require("ejs");
var bcrypt = require('bcrypt');
const {Pool} = require('pg');
var session = require ('express-session');
const flash = require('express-flash');

const passport = require('passport');
const teacherPassport = require('passport')

const intializedPassport = require('./passportConfig');
 intializedPassport(passport);

const teacherIntializedPassport = require('./teacherConfig');
teacherIntializedPassport(teacherPassport);

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
app.use(teacherPassport.initialize())
app.use(teacherPassport.session())
app.use(flash())

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/users/login", (req, res) => {

   res.render('login')
});



// registers user
app.get("/user/register", (req, res) => {
    res.render("register")
});
// ends here




// logout
app.get("/users/logout", (req, res) => {
   req.logout();
   res.render('index', {massage: "You are logged out sucessfully"});
});
// logout all users ends here




// users dashboard
app.get("/users/dashboard", (req, res) => {
    res.render("dashboard", {
        user: req.user.username
    })
});
// ends here the redirect to the user dashboard

// teachers login and registration getters
app.get("/user/teacherslogin", (req, res) => {
    res.render("teacherslogin");
});
app.get("/user/teachersregister", (req, res) => {
    res.render("teachersregister");
});
// ends here

// lesson dashboard

app.get("/lessondashboard",  (req, res)=> {
    var title = 'Hello World';
    var sql = "SELECT title, descr, img, lesson_num, lesson_title, lesson_body FROM classes WHERE title=$1::text";
    
     var values = [title];
      
    pool.query(sql, values, function(err, data, fields){
        if (err) {
            console.log(err);
        }
        

        res.render('lessondashboard', {title: 'Lesson Dashboard', lessonData: data});
        console.log({
         data
        })
        console.log(
            data.rows
        )
    });
})

// ends here

// teacher dashboard
app.get("/teacher/teacherdashboard", (req, res) => {
    res.render("teacherdashboard")
});
// ends here




// post the user information to the database
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
                return res.render("register", {
                  message: "Username already registered"
                });
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
// ends here users login process-->

// teachers login process function

app.post('/user/teachersregister', async (req, res) => {
  
    const teacherusername = req.body.teacherusername;
    const teacheremail = req.body.email;
    const teacherpassword = req.body.teacherpassword;
    const teacherpassword2 = req.body.password2;
    const schoolname = req.body.schoolname;
    
    let errors = [];
    
    console.log ({
        teacherusername, 
        teacheremail,
        teacherpassword,
        teacherpassword2,
        schoolname
    });
  
   
  
    if (!teacherusername || !teacheremail || !teacherpassword || !teacherpassword2 || !schoolname) {
        errors.push({message: "Please enter all fields"});
    }
    
  
  if (teacherpassword.length < 6) {
        errors.push({ message: "Password must be at least 6 characters"});
  }
  
  if (teacherpassword !== teacherpassword2) {
      errors.push({ message: "Password do not match" });
  }
  if (errors.length > 0) {
      res.render('register', {errors, teacherusername, teacheremail, teacherpassword, teacherpassword2});
  } else {
     let  hashedPassword = await bcrypt.hash(teacherpassword, 10);
      console.log(hashedPassword);
  
  
      
      pool.query(
          `SELECT * FROM teacher WHERE email = $1::text`,
          [teacheremail],
          (err, results) => {
              if (err) {
                  console.log(err)
              }
              
              console.log(results.rows);
          
              if(results.rows.length > 0) {
                  errors.push({message: "Email already registered"});
                  res.render("techersregister", { errors });
                  return res.render("teachersregister", {
                    message: "Username already registered"
                  });
         } else {
                
             pool.query(`INSERT INTO teacher (Username, email, pass, schoolname)
                              VALUES ($1::text, $2::text, $3::text, $4::text)
                              RETURNING id, pass, schoolname`,
                              [teacherusername, teacheremail, hashedPassword, schoolname],
                       (err, results) => {
                          if (err) {
                              throw err;
                          }
                          console.log(results.rows);
                          req.flash('success_msg', 'Welcome, you can login in');
                          res.redirect('/teacher/teacherslogin');
                       });
                    
  
       }
  
              
      });
  }
  
  
    
 });
  

// ends here-->

// authenticate the user passport
app.post('/users/login', passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
})); 
// ends here-->

//authenticate the teacher passport
app.post('/user/teacherslogin', teacherPassport.authenticate('login', {
    successRedirect: "/teacher/teacherdashboard",
    failureRedirect: "/teacher/teacherslogin",
    failureFlash: true
}));
// ends here


app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});