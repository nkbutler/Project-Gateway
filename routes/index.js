var express  = require('express');
    auth     = require('../auth');
    db       = require('../db');
var router   = express.Router(),
    login    = express.Router();

var doLogin = function(req, res, next) {
  if (req.body.login) {
    req.body = {
      username : req.body.login.username,
      password : req.body.login.password
    };
    next();
  } else {
    res.send({ status : 1 });
  }
};

var doRegister = function(req, res, next) {
  var user = {
    username  : req.body.register.username,
    email     : req.body.register.email,
    password  : req.body.register.password,
    password2 : req.body.register.password2,
    bio       : req.body.register.bio,
    industry  : req.body.register.industry
  };

  db.user.create(user)
  .then(function(user){
    // Attempt to log in as the new user.
    req.body = {
      username : user.username,
      password : user.password
    };
    next();
  })
  .catch(db.validationHandler(req, res, next, { fieldmap : { passwordsMatch : ['password', 'password2' ] } }));
};

// Render login page on error, redirect to user page when already logged in.
login.route('/')
  .get(
    auth.check({
      // Ask the auth interface to check if the user is already logged in.
      onSuccess : function(req, res, next) { res.redirect('/user/'); },
      onFailure : function(req, res, next) { next(); }
    }),
    function(req, res, next) {
      if (req.baseUrl == '/register') {
        // Render the registration template.
        res.render('user/register', res.ctx);
      } else {
        // Render the login screen's template.
        res.render('user/login', res.ctx);
      }
    }
  )
  .post(
    // If this is a POST request, attempt to authenticate/register the user.
    function(req, res, next) {
      if (req.body.login) {
        doLogin(req, res, next);
      } else if (req.body.register) {
        doRegister(req, res, next);
      }
    },
    auth.login,
    function(req, res, next) {
      if (!req.user) {
        res.send({
          status : 1,
          errors : {
            username : 'Incorrect username or password',
            password : true
          }
        });
      } else {
        res.send({ status : 0 });
      }
    }
  )

router.route('/')
.all(
  function(req, res, next) {
    res.render('index', res.ctx);
  }
);

router.use('/login', login);
router.use('/register', login);
router.route('/logout')
  .get(
    auth.logout,
    function(req, res, next) {
      res.redirect('/');
    });

module.exports = router;
