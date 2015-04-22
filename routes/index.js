var express  = require('express');
    auth     = require('../auth');
    db       = require('../db');
var router   = express.Router(),
    login    = express.Router(),
    register = express.Router();

// Render login page on error, redirect to user page when already logged in.
login.route('/')
  .all(
    auth.check({
      // Ask the auth interface to check if the user is already logged in.
      onSuccess : function(req, res, next) {
        res.redirect('/users/' + req.user.username);
      },
      onFailure : function(req, res, next) {
        next();
      }
    }),
    function(req, res, next) {
      // Build the template rendering context
      res.ctx.add({
        forms : {
          login : {
            errors : {},
            data : {}
          },
          register : {
            errors : {},
            data : {}
          }
        }
      });
      next();
    }
  )
  .post(
    // If this is a POST request, attempt to authenticate the user.
    auth.login,
    function(req, res, next) {
      if (!req.user) {
        res.ctx.forms.login.errors._form = ["Incorrect username or password."];
        res.ctx.forms.login.data.username = req.body.username;
        next();
      } else {
        res.redirect('/users/' + req.user.username);
      }
    }
  )
  .all(function(req, res, next) {
    // Render the login screen's template.
    res.render('login', res.ctx);
  });

register.route('/')
  .all(
    function(req, res, next) {
      // Build the template rendering context
      res.ctx.add({
        forms : {
          login : {
            errors : {},
            data : {}
          },
          register : {
            errors : {},
            data : {}
          }
        }
      });
      next();
    }
  )
  .get(
    function(req, res, next) {
      next('route');
    }
  )
  .post(
    function(req, res, next) {
      var user = {
        username  : req.body.username,
        email     : req.body.email,
        password  : req.body.password,
        password2 : req.body.password2
      };

      db.user.create(user)
      .then(function(user){
        console.log(user);
        next();
      })
      .catch(function(ex){
        console.log(ex);
        if (ex.message === 'Validation error') {
          // validation vails
          for (e in ex.errors) {                        // populate validation errors
            var field = ex.errors[e].path,
            msg = ex.errors[e].message;
            res.ctx.forms.register.errors[field] = [msg];
            if (field == 'password') {
              continue;
            } else {
              res.ctx.forms.register.data[field]   = req.body[field];
            }
          }
          next('route');  // skip to error renderer
        } else {
          next(ex);       // other error
        }
      });
    },
    auth.login,
    function(req, res, next) {
      res.redirect('/users/' + req.user.username);
    }
  );

register.route('/')
  .all(
    function(req, res, next) {
      res.render('register', res.ctx);
    }
  );

router.route('/')
.all(
  function(req, res, next) {
    res.render('index', res.ctx);
  }
);

router.use('/login', login);
router.use('/register', register);
router.route('/logout')
  .get(
    auth.logout,
    function(req, res, next) {
      res.redirect('/');
    });

module.exports = router;
