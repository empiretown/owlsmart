var express = require ('express');
var app = express();
const ejs = require("ejs");
var bcrypt = require('bcrypt');
const {Pool} = require('pg');
var session = require ('express-session');
const flash = require('express-flash');
var path = require('path');
const expressPermission = require('express-permission');
//var urlparser = require('urlparser')

const Passport = require('passport').Passport,
    passport = new Passport(),
    teacherPassport = new Passport();

const intializedPassport = require('./passportConfig');
 intializedPassport(passport);

const teacherIntializedPassport = require('./teacherConfig');
// const { Passport } = require('passport');
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
app.use(teacherPassport.initialize({userProperty: "login"}))
app.use(teacherPassport.session())
app.use(flash())

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/addnew/edit/:class_id', function(req,res, next){ 
      var class_id = req.params.class_id;
    var sql = `SELECT * FROM lesson WHERE class_id =${class_id}`;

    pool.query(sql, function(err, data) {
        if(err) {
            throw err;

            
        }
        res.render('addnew', {title: 'Edit Lesson', editData: data[0], class_id: class_id});
    })
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


app.get("/addnew/create/:class_id", (req, res) => {
    let class_id = req.params.class_id;
    

    res.render('addnew', {class_id: class_id});
})

// users dashboard
app.get("/users/dashboard", (req, res) => {
    res.render("dashboard", {
        // user: req.user.username
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

app.get("/lessondashboard/:class_id",  function (req, res,data) {

      
      let class_id = req.params.class_id;

      var sql = `SELECT * FROM lesson WHERE class_id =${class_id}`

      pool.query(sql, function(err, data) {
        if(err) {
            throw err;    
        }

    res.render('lessondashboard', {title: 'Lesson Dashboard', lessonData: data, class_id: class_id, } )
    })
})

// ends here

// teacher dashboard
app.get("/teacher/teacherdashboard", (req, res) => {
    res.render("teacherdashboard")
});
// ends here

//addnew
app.post('/addnew/create/:class_id', function(req, res, next) {
    const title = req.body.title;
    const descr = req.body.descr;
    const img = req.body.img;
    const id = req.body.id;
    const lesson_num = req.body.lesson_num;
    const lesson_title = req.body.lesson_title;
    const lesson_body = req.body.lesson_body;
    let class_id = req.params.class_id;
     console.log({
         title,
         descr,
         img,
         id,
         lesson_body,
         lesson_num,
         lesson_title
     })
    var sql = `INSERT INTO lesson (lesson_num, lesson_title, class_id, lesson_body)
             VALUES ($1, $2, $3, $4)`;
          var values = [lesson_num, lesson_title, class_id, lesson_body];
    pool.query(sql, values, function(err, data) {
        if (err) {
             throw err
        };            
            console.log("Lesson is inserted successfully");
            //res.render('addnew');

            
     });
   next();    
},

(req, res) => {
console.log("it's all done!");

    var title = req.body.title;
    const descr = req.body.descr;
    const img = req.body.img;
    const id = req.body.id;
    const lesson_num = req.body.lesson_num;
    const lesson_title = req.body.lesson_title;
    const lesson_body = req.body.lesson_body;
    let class_id = req.params.class_id;
    //  console.log({
    //      title,
    //      descr,
    //      img,
    //      id,
    //      lesson_body,
    //      lesson_num,
    //      lesson_title
    //  })

    var sql =  `SELECT * FROM lesson WHERE class_id =${class_id}`;
    
    // var values = [title];

    pool.query(sql, function(err, data, results){
        if (err) throw err;
           
      
            res.render('lessondashboard', {title: 'Lesson Dashboard', lessonData: data, class_id: class_id});
        
     
        
        
    })
   
   

});

app.set('views', path.join(__dirname, 'views'));


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
  
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const schoolname = req.body.schoolname;
    
    let errors = [];
    
    console.log ({
        username, 
        email,
        password,
        password2,
        schoolname
    });
  
   
  
    if (!username || !email || !password || !password2 || !schoolname) {
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
          `SELECT * FROM teacher WHERE email = $1::text`,
          [email],
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
                
             pool.query(`INSERT INTO teacher (username, email, pass, schoolname)
                              VALUES ($1::text, $2::text, $3::text, $4::text)
                              RETURNING teacher_id, pass, schoolname`,
                              [username, email, hashedPassword, schoolname],
                       (err, results) => {
                          if (err) {
                              throw err;
                          }
                          console.log(results.rows);
                          req.flash('success_msg', 'Welcome, you can login in');
                          res.redirect('/user/teacherslogin');
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
    session: false,
    failureFlash: true
})); 
// ends here-->

//authenticate the teacher passport
app.post('/user/teacherslogin', teacherPassport.authenticate('local-teacher-login', {
    successRedirect: "/teacher/teacherdashboard",
    failureRedirect: "/user/teacherslogin",
    session: false,
    failureFlash: true
}));
// ends here


app.listen(PORT, () => {
    console.log(`Server is running ${PORT}`);
});