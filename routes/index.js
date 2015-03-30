var express  = require('express');
    auth     = require('../auth');
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
      res.ctx = {
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
      };
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
      res.ctx = {
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
      };
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
      var error = false;
      var user = {
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
      };
      console.log(req.body);

      if (req.body.password != req.body.password2) {
        res.ctx.forms.register.errors.password = ["Passwords must match."];
        res.ctx.forms.register.data.username = req.body.username;
        res.ctx.forms.register.data.email = req.body.email;
        error = true;
      }

      if (!req.body.username || !req.body.email) {
        if (!req.body.email) {
          res.ctx.forms.register.errors.email = ["Invalid email."];
          res.ctx.forms.register.data.email = undefined;
        }
        if (!req.body.username) {
          res.ctx.forms.register.errors.username = ["Invalid username."];
          res.ctx.forms.register.data.username = undefined;
        }
        error = true;
      } else {
        var errors = auth.checkExists(user);
        if (errors.username || errors.email) {
          if (errors.username) {
            res.ctx.forms.register.errors.username = ["Username already in use."];
            res.ctx.forms.register.data.username = req.body.username;
          }
          if (errors.email) {
            res.ctx.forms.register.errors.email = ["Email address already in use."];
            res.ctx.forms.register.data.email = req.body.email;
          }
          error = true;
        }
      }
      if (error) {
        next('route');
      } else {
        auth.create(user);
        next();
      }
    },
    auth.login,
    function(req, res, next) {
      res.redirect('/users/' + req.user.username);
    }
  );

register.route('/')
  .all(
    function(req, res, next) {
      res.render('login', res.ctx);
    }
  );

router.use('/', login);
router.use('/login', login);
router.use('/register', register);
router.route('/logout')
  .get(
    auth.logout,
    function(req, res, next) {
      res.redirect('/');
    });

module.exports = router;
